package processors

import (
	"context"
	"fmt"
	"net/http"
	"time"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/yetbota/content-service/drivers/constants"
	"github.com/beka-birhanu/yetbota/content-service/drivers/validator"
	driverConfig "github.com/beka-birhanu/yetbota/content-service/drivers/config"
	domainNotification "github.com/beka-birhanu/yetbota/content-service/internal/domain/notification"
	domainUser "github.com/beka-birhanu/yetbota/content-service/internal/domain/user"
	domainFeed "github.com/beka-birhanu/yetbota/content-service/internal/domain/feed"
	domainFollower "github.com/beka-birhanu/yetbota/content-service/internal/domain/follower"
	domainPhoto "github.com/beka-birhanu/yetbota/content-service/internal/domain/photo"
	domainPost "github.com/beka-birhanu/yetbota/content-service/internal/domain/post"
	domainPostphoto "github.com/beka-birhanu/yetbota/content-service/internal/domain/postphoto"
	domainPostSim "github.com/beka-birhanu/yetbota/content-service/internal/domain/postsimilarity"
	domainPostvote "github.com/beka-birhanu/yetbota/content-service/internal/domain/postvote"
	"github.com/beka-birhanu/yetbota/content-service/internal/domain/processors"
	domainStorage "github.com/beka-birhanu/yetbota/content-service/internal/domain/storage"
	"go.temporal.io/api/enums/v1"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

type Executor struct {
	client               client.Client
	newPostActivity      *newPostActivity
	feedUpdateActivity   *feedUpdateActivity
	authorScoringActivity *authorScoringActivity
}

type Config struct {
	Client               client.Client              `validate:"required"`
	PostPhotoRepo        domainPostphoto.Repository `validate:"required"`
	PhotoRepo            domainPhoto.Repository     `validate:"required"`
	Bucket               domainStorage.Bucket       `validate:"required"`
	FollowerRepo         domainFollower.Repository  `validate:"required"`
	PostSimRepo          domainPostSim.Repository   `validate:"required"`
	FeedRepo             domainFeed.Repository      `validate:"required"`
	PostRepo             domainPost.Repository      `validate:"required"`
	PostvoteRepo         domainPostvote.Repository  `validate:"required"`
	BatchStore           domainStorage.Set          `validate:"required"`
	SeenCache            domainStorage.Set          `validate:"required"`
	SeedBonus            float64                    `validate:"required"`
	QScale               float64                    `validate:"required"`
	Epoch                int64                      `validate:"required"`
	HalfLifeHours        float64                    `validate:"required"`
	MinFeedScore         float64                    `validate:"required"`
	CelebrityThreshold   int64                      `validate:"required"`
	MaxCelebrityFeedSize int64                      `validate:"required"`
	ScoringStream        domainStorage.Stream          `validate:"required"`
	UserRepo             domainUser.Repository         `validate:"required"`
	NotificationSender   domainNotification.Sender     `validate:"required"`
	NotificationRepo     domainNotification.Repository `validate:"required"`
	Badges               []driverConfig.Badge
	AuthorConsumerGroup  string `validate:"required"`
	AuthorBatchSize      int64  `validate:"required"`
}

func (c *Config) Validate() error {
	if err := validator.Validate.Struct(c); err != nil {
		return err
	}
	return nil
}

func NewExecutor(cfg *Config) (*Executor, error) {
	if err := cfg.Validate(); err != nil {
		return nil, err
	}
	newPostAct, err := newNewPostActivity(&newPostActConfig{
		PostPhotoRepo:      cfg.PostPhotoRepo,
		PhotoRepo:          cfg.PhotoRepo,
		Bucket:             cfg.Bucket,
		PostRepo:           cfg.PostRepo,
		NotificationRepo:   cfg.NotificationRepo,
		NotificationSender: cfg.NotificationSender,
		UserRepo:           cfg.UserRepo,
	})
	if err != nil {
		return nil, err
	}
	feedUpdateAct, err := newFeedUpdateAct(&feedUpdateActConfig{
		FollowerRepo:         cfg.FollowerRepo,
		PostSimRepo:          cfg.PostSimRepo,
		FeedRepo:             cfg.FeedRepo,
		PostRepo:             cfg.PostRepo,
		PostvoteRepo:         cfg.PostvoteRepo,
		BatchStore:           cfg.BatchStore,
		SeenCache:            cfg.SeenCache,
		SeedBonus:            cfg.SeedBonus,
		QScale:               cfg.QScale,
		Epoch:                cfg.Epoch,
		HalfLifeHours:        cfg.HalfLifeHours,
		MinFeedScore:         cfg.MinFeedScore,
		CelebrityThreshold:   cfg.CelebrityThreshold,
		MaxCelebrityFeedSize: cfg.MaxCelebrityFeedSize,
	})
	if err != nil {
		return nil, err
	}
	authorScoringAct, err := newAuthorScoringAct(&authorScoringActConfig{
		Stream:             cfg.ScoringStream,
		PostRepo:           cfg.PostRepo,
		UserRepo:           cfg.UserRepo,
		NotificationSender: cfg.NotificationSender,
		Badges:             cfg.Badges,
		ConsumerGroup:      cfg.AuthorConsumerGroup,
		BatchSize:          cfg.AuthorBatchSize,
	})
	if err != nil {
		return nil, err
	}
	return &Executor{
		client:                cfg.Client,
		newPostActivity:       newPostAct,
		feedUpdateActivity:    feedUpdateAct,
		authorScoringActivity: authorScoringAct,
	}, nil
}

// RegisterWorkflowsAndActivity registers feed + new-post workflows and activities on the worker.
func (e *Executor) RegisterWorkflowsAndActivity(w worker.Worker) {
	w.RegisterActivity(e.newPostActivity)
	w.RegisterActivity(e.feedUpdateActivity)
	w.RegisterWorkflow(NewPostWorkflow)
	w.RegisterWorkflow(FeedUpdateWorkflow)
}

// RegisterAuthorScoringWorker registers the author scoring workflow and activity on a dedicated worker.
func (e *Executor) RegisterAuthorScoringWorker(w worker.Worker) {
	w.RegisterActivity(e.authorScoringActivity)
	w.RegisterWorkflow(AuthorScoringWorkflow)
}

// StartAuthorScoringWorkflow starts the eternal scoring workflow once (idempotent).
func (e *Executor) StartAuthorScoringWorkflow(ctx context.Context, input processors.AuthorScoringWorkflowInput) error {
	_, err := e.client.ExecuteWorkflow(ctx, client.StartWorkflowOptions{
		ID:                    constants.AuthorScoringWorkflowID,
		TaskQueue:             constants.AuthorScoringWorkflowQueue,
		WorkflowIDReusePolicy: enums.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY,
	}, AuthorScoringWorkflow, input, 0)
	if err != nil {
		return &toddlerr.Error{
			PublicStatusCode:  http.StatusInternalServerError,
			ServiceStatusCode: http.StatusInternalServerError,
			PublicMessage:     "Something went wrong.",
			ServiceMessage:    fmt.Sprintf("Error starting author scoring workflow: %v", err),
		}
	}
	return nil
}

// TriggerFeedUpdateWorkflow implements [processors.Executor].
func (e *Executor) TriggerFeedUpdateWorkflow(ctx context.Context, input processors.FeedUpdateWorkflowInput) error {
	workflowOptions := client.StartWorkflowOptions{
		ID:                    fmt.Sprintf("FEED-UPDATE-%s-%s-%s", input.PostID, input.InteractorID, time.Now().Format(time.RFC3339)),
		TaskQueue:             constants.FeedUpdateWorkflowQueue,
		WorkflowTaskTimeout:   10 * time.Second,
		WorkflowIDReusePolicy: enums.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE,
	}

	_, err := e.client.ExecuteWorkflow(ctx, workflowOptions, FeedUpdateWorkflow, input)
	if err != nil {
		return &toddlerr.Error{
			PublicStatusCode:  http.StatusInternalServerError,
			ServiceStatusCode: http.StatusInternalServerError,
			PublicMessage:     "Something went wrong.",
			ServiceMessage:    fmt.Sprintf("Error starting feed update workflow: %v", err),
		}
	}

	return nil
}

// TriggerAnswerEmbeddingWorkflow implements [processors.Executor]. It starts the
// ai-service AnswerEmbeddingWorkflow (by name, on the shared ingest queue) to embed
// a newly created answer with its question's context.
func (e *Executor) TriggerAnswerEmbeddingWorkflow(ctx context.Context, input processors.AnswerEmbeddingWorkflowInput) error {
	workflowOptions := client.StartWorkflowOptions{
		ID:                    fmt.Sprintf("ANSWER-EMBED-%s-%s", input.CommentID, time.Now().Format(time.RFC3339)),
		TaskQueue:             constants.PostEmbeddingWorkflowQueue,
		WorkflowTaskTimeout:   10 * time.Second,
		WorkflowIDReusePolicy: enums.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE,
	}

	_, err := e.client.ExecuteWorkflow(ctx, workflowOptions, constants.AnswerEmbeddingWorkflowName, input)
	if err != nil {
		return &toddlerr.Error{
			PublicStatusCode:  http.StatusInternalServerError,
			ServiceStatusCode: http.StatusInternalServerError,
			PublicMessage:     "Something went wrong.",
			ServiceMessage:    fmt.Sprintf("Error starting answer embedding workflow: %v", err),
		}
	}
	return nil
}

// TriggerNewPostWorkflow implements [processors.Executor].
func (e *Executor) TriggerNewPostWorkflow(ctx context.Context, input processors.NewPostWorkflowInput) error {
	workflowOptions := client.StartWorkflowOptions{
		ID:                    fmt.Sprintf("NEW-POST-%s-%s", input.PostID, time.Now().Format(time.RFC3339)),
		TaskQueue:             constants.NewPostWorkflowQueue,
		WorkflowTaskTimeout:   10 * time.Second,
		WorkflowIDReusePolicy: enums.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE,
	}

	_, err := e.client.ExecuteWorkflow(ctx, workflowOptions, NewPostWorkflow, input)
	if err != nil {
		return &toddlerr.Error{
			PublicStatusCode:  http.StatusInternalServerError,
			ServiceStatusCode: http.StatusInternalServerError,
			PublicMessage:     "Something went wrong.",
			ServiceMessage:    fmt.Sprintf("Error starting new post workflow: %v", err),
		}
	}
	return nil
}
