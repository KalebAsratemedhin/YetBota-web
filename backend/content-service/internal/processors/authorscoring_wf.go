package processors

import (
	"time"

	processorsDomain "github.com/beka-birhanu/yetbota/content-service/internal/domain/processors"
	"go.temporal.io/sdk/workflow"
)

// AuthorScoringWorkflow runs forever, consuming the scoring Redis stream.
// It scores posts whose stabilizing window has elapsed and awards badges.
// ContinueAsNew every ContinueAfterIter iterations to keep Temporal history bounded.
func AuthorScoringWorkflow(ctx workflow.Context, input processorsDomain.AuthorScoringWorkflowInput, iter int) error {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: 2 * time.Minute,
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	if iter == 0 {
		if err := workflow.ExecuteActivity(ctx, (*authorScoringActivity).EnsureGroup).Get(ctx, nil); err != nil {
			workflow.GetLogger(ctx).Error("EnsureGroup failed", "error", err)
		}
	}

	window := time.Duration(input.StabilizingWindowHours) * time.Hour

	for {
		var entries []ScoringEntry
		if err := workflow.ExecuteActivity(ctx, (*authorScoringActivity).ReadScoringBatch).Get(ctx, &entries); err != nil {
			workflow.GetLogger(ctx).Error("ReadScoringBatch failed", "error", err)
		}

		now := workflow.Now(ctx)
		var readyIDs []string

		for _, e := range entries {
			if now.Sub(e.CreatedAt) < window {
				continue
			}
			if err := workflow.ExecuteActivity(ctx, (*authorScoringActivity).ProcessScoringEntry, e.PostID).Get(ctx, nil); err != nil {
				workflow.GetLogger(ctx).Error("ProcessScoringEntry failed", "postID", e.PostID, "error", err)
				continue
			}
			readyIDs = append(readyIDs, e.StreamID)
		}

		if len(readyIDs) > 0 {
			if err := workflow.ExecuteActivity(ctx, (*authorScoringActivity).AckEntries, readyIDs).Get(ctx, nil); err != nil {
				workflow.GetLogger(ctx).Error("AckEntries failed", "error", err)
			}
		}

		_ = workflow.Sleep(ctx, time.Duration(input.PollIntervalSec)*time.Second)

		iter++
		if iter >= input.ContinueAfterIter {
			return workflow.NewContinueAsNewError(ctx, AuthorScoringWorkflow, input, 0)
		}
	}
}
