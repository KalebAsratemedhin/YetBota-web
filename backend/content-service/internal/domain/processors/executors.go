package processors

import "context"

type NewPostWorkflowInput struct {
	PostID string
}

type FeedUpdateWorkflowInput struct {
	PostID       string
	InteractorID string
}

type PostEmbeddingWorkflowInput struct {
	PostID string
}

// PostEmbeddingResult mirrors the ai-service IngestResult returned by the
// embedding child workflow. Field names match the ai-service JSON payload.
type PostEmbeddingResult struct {
	ContentID   string `json:"content_id"`
	Kind        string `json:"kind"`
	Verdict     string `json:"verdict"`
	DuplicateOf string `json:"duplicate_of"`
	ErrorCode   string `json:"error_code"`
	ProcessedAt string `json:"processed_at"`
}

type AnswerEmbeddingWorkflowInput struct {
	CommentID string
}

type AuthorScoringWorkflowInput struct {
	StabilizingWindowHours int
	PollIntervalSec        int
	BatchSize              int64
	ContinueAfterIter      int
	ConsumerGroup          string
}

type Executor interface {
	TriggerNewPostWorkflow(ctx context.Context, input NewPostWorkflowInput) error
	TriggerFeedUpdateWorkflow(ctx context.Context, input FeedUpdateWorkflowInput) error
	TriggerAnswerEmbeddingWorkflow(ctx context.Context, input AnswerEmbeddingWorkflowInput) error
}
