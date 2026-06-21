package constants

const (
	DefaultPaginationLength = 15
	MaxPaginationLength     = 20
	DefaultPhoneRegion      = "ETH"
)

const (
	MB                    = 1 << (10 * 2)
	MaxUploadSize         = 20 * MB
	URLExpiration         = 30
	MaxImageResolution    = 3840
	WebImageResolution    = 1080
	MobileImageResolution = 750
)

const (
	MigrationFolder = "migrations"
)

const (
	RoleAdmin = "ADMIN"
	RoleUser  = "USER"
)

const (
	ModerationStatusVisible   = "VISIBLE"
	ModerationStatusHidden    = "HIDDEN"
	ModerationStatusRemoved   = "REMOVED"
	ModerationStatusDuplicate = "DUPLICATE"
)

const (
	VerdictDuplicate = "duplicate"
)

const (
	FeedUpdateWorkflowQueue    = "WF_FEED_UPDATE_QUEUE"
	NewPostWorkflowQueue       = "WF_NEW_POST_QUEUE"
	PostEmbeddingWorkflowQueue = "WF_POST_INGESTING_QUEUE"
	AuthorScoringWorkflowQueue = "AUTHOR_SCORING_QUEUE"

	PostEmbeddingWorkflowName   = "IngestContentWorkflow"
	AnswerEmbeddingWorkflowName = "AnswerEmbeddingWorkflow"
	AuthorScoringWorkflowID     = "author-scoring-eternal"

	PostScoringStreamKey = "POST_SCORING_STREAM"
)

const (
	FeedFanOutBatchSize   = 500
	FanOutBatchTTLSeconds = 3600
)

var SkipAuthHTTP = map[string]struct{}{
	"GET /posts/":        {},
	"GET /posts/{id}":    {},
	"GET /comments/":     {},
	"GET /comments/{id}": {},
}

var AllowedAccessMap = map[string]struct{}{
	RoleAdmin: {},
	RoleUser:  {},
}

var AllowedAdminAccessMap = map[string]struct{}{
	RoleAdmin: {},
}

var AllowedCSAAccessMap = map[string]struct{}{
	RoleAdmin: {},
}
