package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	firebase "firebase.google.com/go"
	"golang.org/x/oauth2/jwt"
	"google.golang.org/api/option"

	"github.com/aarondl/sqlboiler/v4/boil"
	"github.com/beka-birhanu/yetbota/content-service/drivers/config"
	"github.com/beka-birhanu/yetbota/content-service/drivers/constants"
	"github.com/beka-birhanu/yetbota/content-service/drivers/dbmigrations"
	jwtDriver "github.com/beka-birhanu/yetbota/content-service/drivers/jwt"
	logger "github.com/beka-birhanu/yetbota/content-service/drivers/logger"
	neo4jDriver "github.com/beka-birhanu/yetbota/content-service/drivers/neo4j"
	notificationSenderDriver "github.com/beka-birhanu/yetbota/content-service/drivers/notification_sender"
	"github.com/beka-birhanu/yetbota/content-service/drivers/postgres"
	redisDriver "github.com/beka-birhanu/yetbota/content-service/drivers/redis"
	"github.com/beka-birhanu/yetbota/content-service/drivers/storage"
	temporalDriver "github.com/beka-birhanu/yetbota/content-service/drivers/temporal"
	"github.com/beka-birhanu/yetbota/content-service/drivers/validator"
	"github.com/pressly/goose"
	"go.temporal.io/sdk/worker"
	"go.uber.org/zap/zapcore"

	cmdHttp "github.com/beka-birhanu/yetbota/content-service/cmd/http"
	domainProcessors "github.com/beka-birhanu/yetbota/content-service/internal/domain/processors"
	"github.com/beka-birhanu/yetbota/content-service/internal/processors"
	"github.com/beka-birhanu/yetbota/content-service/internal/services/endpoint"
	repoAdmin "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/admin"
	repoComment "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/comment"
	repoCommentVote "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/commentvote"
	repoFeed "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/feed"
	repoFollower "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/follower"
	repoModeration "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/moderation"
	repoNotification "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/notification"
	repoPhoto "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/photo"
	repoPost "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/post"
	repoPostPhoto "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/postphoto"
	repoPostSim "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/postsimilarity"
	repoPostVote "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/postvote"
	repoSavedPost "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/savedpost"
	repoUser "github.com/beka-birhanu/yetbota/content-service/internal/services/repository/user"
	adminSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/admin"
	commentSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/comment"
	feedSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/feed"
	moderationSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/moderation"
	notificationSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/notification"
	postSvc "github.com/beka-birhanu/yetbota/content-service/internal/services/usecase/post"
	httpTransport "github.com/beka-birhanu/yetbota/content-service/internal/transport/http"
	"golang.org/x/sync/errgroup"
)

func main() {
	validator.InitValidator()
	logger.InitDefault(
		logger.MaskEnabled(),
		logger.WithStdout(),
		logger.WithLevel(zapcore.DebugLevel),
	)

	ctx := context.Background()

	cfg, err := config.Load()
	if err != nil {
		panic(fmt.Errorf("error load config: %v", err))
	}

	pgdb, err := postgres.NewDB(&postgres.Config{
		Host:     cfg.Postgres.Host,
		Port:     cfg.Postgres.Port,
		User:     cfg.Postgres.User,
		Password: cfg.Postgres.Password,
		DB:       cfg.Postgres.DB,
	})
	if err != nil {
		panic(fmt.Errorf("error connect postgres: %v", err))
	}
	defer func() {
		_ = pgdb.Close()
	}()

	boil.SetDB(pgdb)

	if err := pgdb.Ping(); err != nil {
		panic(fmt.Errorf("error pinging database: %v", err))
	}
	fmt.Println("Database connection successful!")

	dbGoose, err := dbmigrations.RunDBMigrations(&dbmigrations.Config{
		Host:     cfg.Postgres.Host,
		Port:     cfg.Postgres.Port,
		User:     cfg.Postgres.User,
		Password: cfg.Postgres.Password,
		DB:       cfg.Postgres.DB,
	})
	if err != nil {
		panic(fmt.Errorf("error run DB migrations: %v", err))
	}

	if err := goose.SetDialect("postgres"); err != nil {
		panic(fmt.Errorf("error setting goose dialect: %v", err))
	}

	currentVersion, err := goose.GetDBVersion(dbGoose)
	if err != nil {
		fmt.Printf("Migration table initialization: %v\n", err)
	}
	fmt.Printf("Current migration version: %d\n", currentVersion)

	if err := goose.Up(dbGoose, constants.MigrationFolder); err != nil {
		panic(fmt.Errorf("error running migrations: %v", err))
	}

	redisConn, err := redisDriver.NewConnection(ctx, &redisDriver.Config{
		Address:         cfg.Redis.Address,
		Password:        cfg.Redis.Password,
		DB:              cfg.Redis.DB,
		PoolSize:        cfg.Redis.PoolSize,
		MinIdleConns:    cfg.Redis.MinIdleConns,
		MaxIdleConns:    cfg.Redis.MaxIdleConns,
		MaxRetries:      cfg.Redis.MaxRetries,
		DialTimeout:     time.Duration(cfg.Redis.DialTimeout) * time.Second,
		ReadTimeout:     time.Duration(cfg.Redis.ReadTimeout) * time.Second,
		WriteTimeout:    time.Duration(cfg.Redis.WriteTimeout) * time.Second,
		PoolTimeout:     time.Duration(cfg.Redis.PoolTimeout) * time.Second,
		ConnMaxIdleTime: time.Duration(cfg.Redis.ConnMaxIdleTime) * time.Second,
		ConnMaxLifetime: time.Duration(cfg.Redis.ConnMaxLifetime) * time.Second,
		TLS:             cfg.Redis.TLS,
	})
	if err != nil {
		panic(fmt.Errorf("error connecting to redis: %v", err))
	}
	fmt.Println("Redis connection successful!")

	sessionManager, err := jwtDriver.NewSessionManager(&jwtDriver.Config{
		AccessKey:  cfg.Jwt.AccessToken.Secret,
		RefreshKey: cfg.Jwt.RefreshToken.Secret,
		AccessTTL:  time.Duration(cfg.Jwt.AccessToken.Expiration) * time.Second,
		RefreshTTL: time.Duration(cfg.Jwt.RefreshToken.Expiration) * time.Second,
		Algo:       cfg.Jwt.Algorithm,
		RedisConn:  redisConn,
	})
	if err != nil {
		panic(fmt.Errorf("error creating session manager: %v", err))
	}

	postRepo, err := repoPost.NewRepo(&repoPost.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating post repo: %v", err))
	}

	photoRepo, err := repoPhoto.NewRepo(&repoPhoto.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating photo repo: %v", err))
	}

	postPhotoRepo, err := repoPostPhoto.NewRepo(&repoPostPhoto.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating postphoto repo: %v", err))
	}

	bucket, err := storage.NewCloudinaryBlob(&storage.CloudinaryConfig{
		CloudName: cfg.Cloudinary.CloudName,
		APIKey:    cfg.Cloudinary.APIKey,
		APISecret: cfg.Cloudinary.APISecret,
		Folder:    cfg.Cloudinary.Folder,
	})
	if err != nil {
		panic(fmt.Errorf("error creating cloudinary blob: %v", err))
	}

	temporalClient, err := temporalDriver.NewClient(&temporalDriver.Config{
		Host:      cfg.Temporal.Host,
		Namespace: cfg.Temporal.Namespace,
	})
	if err != nil {
		panic(fmt.Errorf("error creating temporal client: %v", err))
	}
	defer temporalClient.Close()
	fmt.Println("Temporal connection successful!")

	neo4jConn, err := neo4jDriver.NewDriver(&neo4jDriver.Config{
		URI:      cfg.Neo4j.URI,
		Username: cfg.Neo4j.Username,
		Password: cfg.Neo4j.Password,
	})
	if err != nil {
		panic(fmt.Errorf("error creating neo4j driver: %v", err))
	}
	defer func() {
		_ = neo4jConn.Close(ctx)
	}()
	fmt.Println("Neo4j connection successful!")

	feedRepo, err := repoFeed.NewRedisRepository(&repoFeed.Config{
		RDB:    redisConn,
		Prefix: "USER_FEED",
	})
	if err != nil {
		panic(fmt.Errorf("error creating feed repo: %v", err))
	}

	postVoteRepo, err := repoPostVote.NewRepo(&repoPostVote.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating postvote repo: %v", err))
	}

	commentVoteRepo, err := repoCommentVote.NewRepo(&repoCommentVote.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating commentvote repo: %v", err))
	}

	savedPostRepo, err := repoSavedPost.NewRepo(&repoSavedPost.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating savedpost repo: %v", err))
	}

	followerRepo, err := repoFollower.NewRepo(&repoFollower.Config{Driver: neo4jConn, DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating user repo: %v", err))
	}

	postSimRepo, err := repoPostSim.NewRepo(&repoPostSim.Config{Driver: neo4jConn})
	if err != nil {
		panic(fmt.Errorf("error creating postsimilarity repo: %v", err))
	}

	fanOutBatchStore, err := storage.NewSet(&storage.Config{RDB: redisConn, Prefix: "FANOUT_BATCH"})
	if err != nil {
		panic(fmt.Errorf("error creating fanout batch store: %v", err))
	}

	seenCache, err := storage.NewSet(&storage.Config{RDB: redisConn, Prefix: "SEEN_FEED"})
	if err != nil {
		panic(fmt.Errorf("error creating seen cache: %v", err))
	}

	scoringStream, err := storage.NewStream(&storage.StreamConfig{
		RDB: redisConn,
		Key: constants.PostScoringStreamKey,
	})
	if err != nil {
		panic(fmt.Errorf("error creating scoring stream: %v", err))
	}

	userRepo, err := repoUser.NewRepo(&repoUser.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating user repo: %v", err))
	}

	jwtConf := &jwt.Config{
		Email:      cfg.Notification.FirebaseClientEmail,
		PrivateKey: []byte(strings.ReplaceAll(cfg.Notification.FirebasePrivateKey, `\n`, "\n")),
		Scopes:     []string{"https://www.googleapis.com/auth/cloud-platform"},
		TokenURL:   "https://oauth2.googleapis.com/token",
	}
	firebaseApp, err := firebase.NewApp(ctx, &firebase.Config{ProjectID: cfg.Notification.FirebaseProjectID}, option.WithTokenSource(jwtConf.TokenSource(ctx)))
	if err != nil {
		panic(fmt.Errorf("error creating firebase app: %v", err))
	}

	notificationSender, err := notificationSenderDriver.NewFirebaseSender(&notificationSenderDriver.Config{
		App:                          firebaseApp,
		AndroidNotificationChannelID: cfg.Notification.AndroidNotificationChannelID,
	})
	if err != nil {
		panic(fmt.Errorf("error creating notification sender: %v", err))
	}

	notificationRepo, err := repoNotification.NewRepo(&repoNotification.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating notification repo: %v", err))
	}

	executor, err := processors.NewExecutor(&processors.Config{
		Client:               temporalClient,
		PostPhotoRepo:        postPhotoRepo,
		PhotoRepo:            photoRepo,
		Bucket:               bucket,
		FollowerRepo:         followerRepo,
		PostSimRepo:          postSimRepo,
		FeedRepo:             feedRepo,
		PostRepo:             postRepo,
		PostvoteRepo:         postVoteRepo,
		BatchStore:           fanOutBatchStore,
		SeenCache:            seenCache,
		SeedBonus:            cfg.Feed.SeedBonus,
		QScale:               cfg.Feed.QScale,
		Epoch:                cfg.Feed.Epoch,
		HalfLifeHours:        cfg.Feed.HalfLifeHours,
		MinFeedScore:         cfg.Feed.MinFeedScore,
		CelebrityThreshold:   cfg.Feed.CelebrityThreshold,
		MaxCelebrityFeedSize: int64(cfg.Feed.MaxCelebrityFeedSize),
		ScoringStream:        scoringStream,
		UserRepo:             userRepo,
		NotificationSender:   notificationSender,
		NotificationRepo:     notificationRepo,
		Badges:               cfg.AuthorRating.Badges,
		AuthorConsumerGroup:  cfg.AuthorRating.ConsumerGroup,
		AuthorBatchSize:      cfg.AuthorRating.BatchSize,
	})
	if err != nil {
		panic(fmt.Errorf("error creating executor: %v", err))
	}

	postService, err := postSvc.NewService(&postSvc.Config{
		PostRepo:        postRepo,
		PostVoteRepo:    postVoteRepo,
		CommentVoteRepo: commentVoteRepo,
		FollowerRepo:    followerRepo,
		SavedPostRepo:   savedPostRepo,
		PhotoRepo:       photoRepo,
		PostPhotoRepo:   postPhotoRepo,
		Bucket:          bucket,
		Executor:        executor,
		ScoringStream:   scoringStream,
	})
	if err != nil {
		panic(fmt.Errorf("error creating post service: %v", err))
	}

	seenRepo, err := repoFeed.NewSeenRepo(&repoFeed.SeenConfig{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating seen repo: %v", err))
	}

	feedService, err := feedSvc.NewService(&feedSvc.Config{
		FeedRepo:           feedRepo,
		SeenRepo:           seenRepo,
		FollowerRepo:       followerRepo,
		PostRepo:           postRepo,
		PostPhotoRepo:      postPhotoRepo,
		PostVoteRepo:       postVoteRepo,
		SavedPostRepo:      savedPostRepo,
		PhotoRepo:          photoRepo,
		SeenCache:          seenCache,
		SeenCacheTTL:       cfg.Feed.SeenCacheTTL,
		CelebrityThreshold: cfg.Feed.CelebrityThreshold,
	})
	if err != nil {
		panic(fmt.Errorf("error creating feed service: %v", err))
	}

	commentRepo, err := repoComment.NewRepo(&repoComment.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating comment repo: %v", err))
	}

	commentService, err := commentSvc.NewService(&commentSvc.Config{
		CommentRepo:     commentRepo,
		CommentVoteRepo: commentVoteRepo,
		PostRepo:        postRepo,
		Executor:        executor,
	})
	if err != nil {
		panic(fmt.Errorf("error creating comment service: %v", err))
	}

	notificationService, err := notificationSvc.NewService(&notificationSvc.Config{
		NotificationRepo: notificationRepo,
	})
	if err != nil {
		panic(fmt.Errorf("error creating notification service: %v", err))
	}

	moderationRepo, err := repoModeration.NewRepo(&repoModeration.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating moderation repo: %v", err))
	}

	reportRateLimiter, err := repoModeration.NewRateLimiter(&repoModeration.RateLimitConfig{RDB: redisConn})
	if err != nil {
		panic(fmt.Errorf("error creating report rate limiter: %v", err))
	}

	userBanner, err := repoModeration.NewBanner(&repoModeration.BannerConfig{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating user banner: %v", err))
	}

	moderationService, err := moderationSvc.NewService(&moderationSvc.Config{
		ModerationRepo:     moderationRepo,
		RateLimiter:        reportRateLimiter,
		PostRepo:           postRepo,
		CommentRepo:        commentRepo,
		Banner:             userBanner,
		NotificationRepo:   notificationRepo,
		NotificationSender: notificationSender,
		UserRepo:           userRepo,
		AutoHideThreshold:  cfg.Moderation.AutoHideThreshold,
		RateLimitMax:       cfg.Moderation.RateLimitMax,
		RateLimitWindow:    time.Duration(cfg.Moderation.RateLimitWindowSec) * time.Second,
	})
	if err != nil {
		panic(fmt.Errorf("error creating moderation service: %v", err))
	}

	adminRepo, err := repoAdmin.NewRepo(&repoAdmin.Config{DB: pgdb})
	if err != nil {
		panic(fmt.Errorf("error creating admin repo: %v", err))
	}

	adminService, err := adminSvc.NewService(&adminSvc.Config{Repo: adminRepo})
	if err != nil {
		panic(fmt.Errorf("error creating admin service: %v", err))
	}

	endpoints, err := endpoint.NewEndpoints(&endpoint.Config{
		PostService:         postService,
		CommentService:      commentService,
		FeedService:         feedService,
		NotificationService: notificationService,
		ModerationService:   moderationService,
		AdminService:        adminService,
	})
	if err != nil {
		panic(fmt.Errorf("error creating endpoints: %v", err))
	}

	httpRouter, err := httpTransport.NewRouter(&httpTransport.Config{
		E:              endpoints,
		SessionManager: sessionManager,
		CorsHosts:      cfg.Cors.Hosts,
	})
	if err != nil {
		panic(fmt.Errorf("error creating HTTP router: %v", err))
	}

	sigCtx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()

	newPostWorker := worker.New(temporalClient, constants.NewPostWorkflowQueue, worker.Options{})
	feedUpdateWorker := worker.New(temporalClient, constants.FeedUpdateWorkflowQueue, worker.Options{})
	authorScoringWorker := worker.New(temporalClient, constants.AuthorScoringWorkflowQueue, worker.Options{})
	executor.RegisterWorkflowsAndActivity(newPostWorker)
	executor.RegisterWorkflowsAndActivity(feedUpdateWorker)
	executor.RegisterAuthorScoringWorker(authorScoringWorker)

	if err := newPostWorker.Start(); err != nil {
		panic(fmt.Errorf("error starting new post worker: %v", err))
	}
	if err := feedUpdateWorker.Start(); err != nil {
		panic(fmt.Errorf("error starting feed update worker: %v", err))
	}
	if err := authorScoringWorker.Start(); err != nil {
		panic(fmt.Errorf("error starting author scoring worker: %v", err))
	}

	if err := executor.StartAuthorScoringWorkflow(ctx, domainProcessors.AuthorScoringWorkflowInput{
		StabilizingWindowHours: cfg.AuthorRating.StabilizingWindowHours,
		PollIntervalSec:        cfg.AuthorRating.PollIntervalSec,
		BatchSize:              cfg.AuthorRating.BatchSize,
		ContinueAfterIter:      cfg.AuthorRating.ContinueAfterIter,
		ConsumerGroup:          cfg.AuthorRating.ConsumerGroup,
	}); err != nil {
		panic(fmt.Errorf("error starting author scoring workflow: %v", err))
	}

	eg, egCtx := errgroup.WithContext(sigCtx)
	eg.Go(func() error {
		<-egCtx.Done()
		newPostWorker.Stop()
		feedUpdateWorker.Stop()
		authorScoringWorker.Stop()
		return nil
	})
	eg.Go(func() error {
		return cmdHttp.RunServer(egCtx, &cmdHttp.Config{
			Port:         cfg.Rest.Port,
			Handler:      httpRouter,
			ReadTimeout:  time.Duration(cfg.Rest.ReadTimeout) * time.Second,
			WriteTimeout: time.Duration(cfg.Rest.WriteTimeout) * time.Second,
			IdleTimeout:  time.Duration(cfg.Rest.IdleTimeout) * time.Second,
		})
	})
	if err := eg.Wait(); err != nil {
		panic(fmt.Errorf("server error: %v", err))
	}
}
