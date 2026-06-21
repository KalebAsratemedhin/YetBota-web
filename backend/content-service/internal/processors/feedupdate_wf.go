package processors

import (
	"time"

	processorsDomain "github.com/beka-birhanu/yetbota/content-service/internal/domain/processors"
	"go.temporal.io/sdk/workflow"
)

func FeedUpdateWorkflow(ctx workflow.Context, input processorsDomain.FeedUpdateWorkflowInput) error {
	logger := workflow.GetLogger(ctx)

	ao := workflow.ActivityOptions{
		StartToCloseTimeout:    2 * time.Minute,
		ScheduleToCloseTimeout: 15 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// Step 1: Compute post score and cache it.
	var fanOutData PostFanOutData
	if err := workflow.ExecuteActivity(ctx, (*feedUpdateActivity).FetchPostFanOutData, input.PostID).Get(ctx, &fanOutData); err != nil {
		return err
	}
	if err := workflow.ExecuteActivity(ctx, (*feedUpdateActivity).CachePostScore, input.PostID, fanOutData.Score).Get(ctx, nil); err != nil {
		logger.Error("CachePostScore failed", "error", err)
	}

	// Step 2: Build follower depth-batches and similarity tree in parallel.
	followerFuture := workflow.ExecuteActivity(ctx, (*feedUpdateActivity).GetFollowerTree, fanOutData.AuthorID, fanOutData.Score)
	simFuture := workflow.ExecuteActivity(ctx, (*feedUpdateActivity).GetSimilarPostsTree, input.PostID, fanOutData.Score)

	var followerResult FollowerFanOutResult
	if err := followerFuture.Get(ctx, &followerResult); err != nil {
		return err
	}
	var simResult SimFanOutResult
	if err := simFuture.Get(ctx, &simResult); err != nil {
		return err
	}

	// Step 3: Fan out post to reached users.
	// Celebrity authors skip follower push; their post goes to the celebrity feed sorted set instead.
	// Sim interactors always get direct push regardless of celebrity status.
	if followerResult.IsCelebrity {
		if err := workflow.ExecuteActivity(ctx, (*feedUpdateActivity).PublishToCelebrityFeed, fanOutData.AuthorID, input.PostID, fanOutData.Score).Get(ctx, nil); err != nil {
			logger.Error("PublishToCelebrityFeed failed", "error", err)
		}
	}

	allBatchKeys := append(followerResult.BatchKeys, simResult.BatchUserKeys...)
	fanOutFutures := make([]workflow.Future, 0, len(allBatchKeys))
	for _, key := range allBatchKeys {
		fanOutFutures = append(fanOutFutures, workflow.ExecuteActivity(ctx, (*feedUpdateActivity).FanOutFeedBatch, input.PostID, key, fanOutData.Score))
	}
	for _, f := range fanOutFutures {
		if err := f.Get(ctx, nil); err != nil {
			logger.Error("FanOutFeedBatch failed", "error", err)
		}
	}

	// Step 4: Fan out similar posts to all reached users + author.
	// For celebrity authors followerResult.BatchKeys is empty so sim fan-out only covers sim interactors.
	// Skips users who have already seen the sim post; ZADD GT keeps higher score.
	if len(simResult.SimPosts) > 0 {
		simFanFutures := make([]workflow.Future, 0, len(allBatchKeys)+1)
		for _, key := range followerResult.BatchKeys {
			simFanFutures = append(simFanFutures, workflow.ExecuteActivity(ctx, (*feedUpdateActivity).FanOutSimilarPostsToFollowerBatch, simResult.SimPosts, key))
		}
		for _, key := range simResult.BatchUserKeys {
			simFanFutures = append(simFanFutures, workflow.ExecuteActivity(ctx, (*feedUpdateActivity).FanOutSimilarPostsToUserBatch, simResult.SimPosts, key))
		}
		simFanFutures = append(simFanFutures, workflow.ExecuteActivity(ctx, (*feedUpdateActivity).FanOutSimilarPostsToAuthor, fanOutData.AuthorID, simResult.SimPosts))
		for _, f := range simFanFutures {
			if err := f.Get(ctx, nil); err != nil {
				logger.Error("FanOutSimilarPosts failed", "error", err)
			}
		}
	}

	logger.Info("FeedUpdateWorkflow completed", "postID", input.PostID,
		"followerBatches", len(followerResult.BatchKeys), "simBatches", len(simResult.BatchUserKeys),
		"simPosts", len(simResult.SimPosts))
	return nil
}
