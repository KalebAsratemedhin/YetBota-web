package processors

import (
	"context"
	"fmt"
	"net/http"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/yetbota/content-service/drivers/rabbitmq"
	"github.com/beka-birhanu/yetbota/content-service/drivers/validator"
	domainComment "github.com/beka-birhanu/yetbota/content-service/internal/domain/comment"
	domainPost "github.com/beka-birhanu/yetbota/content-service/internal/domain/post"
	processorsDomain "github.com/beka-birhanu/yetbota/content-service/internal/domain/processors"
	"github.com/beka-birhanu/yetbota/content-service/internal/messaging"
)

type JobPublisher struct {
	publisher  *rabbitmq.Publisher
	postRepo   domainPost.Repository
	commentRepo domainComment.Repository
}

type JobPublisherConfig struct {
	Publisher   *rabbitmq.Publisher      `validate:"required"`
	PostRepo    domainPost.Repository    `validate:"required"`
	CommentRepo domainComment.Repository `validate:"required"`
}

func NewJobPublisher(cfg *JobPublisherConfig) (*JobPublisher, error) {
	if err := validator.Validate.Struct(cfg); err != nil {
		return nil, err
	}
	return &JobPublisher{
		publisher:   cfg.Publisher,
		postRepo:    cfg.PostRepo,
		commentRepo: cfg.CommentRepo,
	}, nil
}

func (p *JobPublisher) TriggerNewPostWorkflow(ctx context.Context, input processorsDomain.NewPostWorkflowInput) error {
	if err := p.publisher.Publish(ctx, messaging.QueueNewPost, messaging.NewPostMessage{PostID: input.PostID}); err != nil {
		return publishError("new post", err)
	}
	return nil
}

func (p *JobPublisher) TriggerFeedUpdateWorkflow(ctx context.Context, input processorsDomain.FeedUpdateWorkflowInput) error {
	if err := p.publisher.Publish(ctx, messaging.QueueFeedUpdate, messaging.FeedUpdateMessage{
		PostID:       input.PostID,
		InteractorID: input.InteractorID,
	}); err != nil {
		return publishError("feed update", err)
	}
	return nil
}

func (p *JobPublisher) TriggerAnswerEmbeddingWorkflow(ctx context.Context, input processorsDomain.AnswerEmbeddingWorkflowInput) error {
	comment, err := p.commentRepo.Read(ctx, input.CommentID)
	if err != nil {
		return err
	}
	question, err := p.postRepo.Read(ctx, comment.PostID)
	if err != nil {
		return err
	}
	msg := buildAnswerIngestMessage(comment, question)
	if err := p.publisher.Publish(ctx, messaging.QueueAIIngest, msg); err != nil {
		return publishError("answer embedding", err)
	}
	return nil
}

func publishError(kind string, err error) error {
	return &toddlerr.Error{
		PublicStatusCode:  http.StatusInternalServerError,
		ServiceStatusCode: http.StatusInternalServerError,
		PublicMessage:     "Something went wrong.",
		ServiceMessage:    fmt.Sprintf("Error publishing %s job: %v", kind, err),
	}
}
