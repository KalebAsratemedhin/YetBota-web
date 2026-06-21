package endpoint

import (
	"github.com/go-kit/kit/endpoint"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/yetbota/content-service/drivers/validator"
	adminSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/admin"
	commentSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/comment"
	feedSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/feed"
	moderationSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/moderation"
	notificationSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/notification"
	postSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/post"
)

type Endpoints struct {
	PostAdd    endpoint.Endpoint
	PostRead   endpoint.Endpoint
	PostUpdate endpoint.Endpoint
	PostVote   endpoint.Endpoint
	PostList   endpoint.Endpoint
	PostSave   endpoint.Endpoint
	PostUnsave endpoint.Endpoint

	CommentAdd    endpoint.Endpoint
	CommentRead   endpoint.Endpoint
	CommentList   endpoint.Endpoint
	CommentDelete endpoint.Endpoint
	CommentVote   endpoint.Endpoint

	FeedGet        endpoint.Endpoint
	FeedMarkViewed endpoint.Endpoint

	NotificationList       endpoint.Endpoint
	NotificationMarkAsRead endpoint.Endpoint
	NotificationDelete     endpoint.Endpoint

	ReportCreate        endpoint.Endpoint
	ModerationListCases endpoint.Endpoint
	ModerationGetCase   endpoint.Endpoint
	ModerationAct       endpoint.Endpoint

	AdminOverviewStats  endpoint.Endpoint
	AdminOverviewGrowth endpoint.Endpoint
	AdminUserStats      endpoint.Endpoint
	AdminSystemAudit    endpoint.Endpoint
}

type Config struct {
	PostService         postSvc.Service         `validate:"required"`
	CommentService      commentSvc.Service      `validate:"required"`
	FeedService         feedSvc.Service         `validate:"required"`
	NotificationService notificationSvc.Service `validate:"required"`
	ModerationService   moderationSvc.Service   `validate:"required"`
	AdminService        adminSvc.Service        `validate:"required"`
}

func (c *Config) Validate() error {
	if err := validator.Validate.Struct(c); err != nil {
		return toddlerr.FromValidationErrors(err)
	}
	return nil
}

func NewEndpoints(c *Config) (*Endpoints, error) {
	if err := c.Validate(); err != nil {
		return nil, err
	}
	return &Endpoints{
		PostAdd:    makePostAddEndpoint(c.PostService),
		PostRead:   makePostReadEndpoint(c.PostService),
		PostUpdate: makePostUpdateEndpoint(c.PostService),
		PostVote:   makePostVoteEndpoint(c.PostService),
		PostList:   makePostListEndpoint(c.PostService),
		PostSave:   makePostSaveEndpoint(c.PostService),
		PostUnsave: makePostUnsaveEndpoint(c.PostService),

		CommentAdd:    makeCommentAddEndpoint(c.CommentService),
		CommentRead:   makeCommentReadEndpoint(c.CommentService),
		CommentList:   makeCommentListEndpoint(c.CommentService),
		CommentDelete: makeCommentDeleteEndpoint(c.CommentService),
		CommentVote:   makeCommentVoteEndpoint(c.CommentService),

		FeedGet:        makeFeedGetEndpoint(c.FeedService),
		FeedMarkViewed: makeFeedMarkViewedEndpoint(c.FeedService),

		NotificationList:       makeNotificationListEndpoint(c.NotificationService),
		NotificationMarkAsRead: makeNotificationMarkAsReadEndpoint(c.NotificationService),
		NotificationDelete:     makeNotificationDeleteEndpoint(c.NotificationService),

		ReportCreate:        makeReportCreateEndpoint(c.ModerationService),
		ModerationListCases: makeModerationListCasesEndpoint(c.ModerationService),
		ModerationGetCase:   makeModerationGetCaseEndpoint(c.ModerationService),
		ModerationAct:       makeModerationActEndpoint(c.ModerationService),

		AdminOverviewStats:  makeAdminOverviewStatsEndpoint(c.AdminService),
		AdminOverviewGrowth: makeAdminOverviewGrowthEndpoint(c.AdminService),
		AdminUserStats:      makeAdminUserStatsEndpoint(c.AdminService),
		AdminSystemAudit:    makeAdminSystemAuditEndpoint(c.AdminService),
	}, nil
}
