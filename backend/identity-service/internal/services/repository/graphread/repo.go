package graphread

import (
	"context"
	"fmt"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/identity-service/drivers/validator"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type UserWithDepth struct {
	UserID string
	Depth  int
}

type Repository interface {
	FollowerTree(ctx context.Context, authorID string, maxDepth int) ([]UserWithDepth, error)
	ListFollowedIDs(ctx context.Context, userID string) ([]string, error)
	IsFollowing(ctx context.Context, followerID string, userIDs []string) (map[string]bool, error)
	FollowersOf(ctx context.Context, userIDs []string) (map[string][]string, error)
}

type repo struct {
	driver neo4j.DriverWithContext
}

type Config struct {
	Driver neo4j.DriverWithContext `validate:"required"`
}

func (c *Config) Validate() error {
	if err := validator.Validate.Struct(c); err != nil {
		return toddlerr.FromValidationErrors(err)
	}
	return nil
}

func NewRepo(c *Config) (Repository, error) {
	if err := c.Validate(); err != nil {
		return nil, err
	}
	return &repo{driver: c.Driver}, nil
}

func (r *repo) FollowerTree(ctx context.Context, authorID string, maxDepth int) ([]UserWithDepth, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func() { _ = session.Close(ctx) }()

	result, err := session.Run(ctx,
		fmt.Sprintf(`MATCH path = (follower:User)-[:FOLLOWS*1..%d]->(author:User {id: $authorID})
RETURN follower.id AS userID, min(length(path)) AS depth`, maxDepth),
		map[string]any{"authorID": authorID},
	)
	if err != nil {
		return nil, graphReadErr("follower tree query failed", err)
	}

	var users []UserWithDepth
	for result.Next(ctx) {
		rec := result.Record()
		userID, ok := rec.Get("userID")
		if !ok {
			return nil, graphReadErr("follower tree: missing userID", nil)
		}
		depth, ok := rec.Get("depth")
		if !ok {
			return nil, graphReadErr("follower tree: missing depth", nil)
		}
		users = append(users, UserWithDepth{
			UserID: userID.(string),
			Depth:  int(depth.(int64)),
		})
	}
	if err := result.Err(); err != nil {
		return nil, graphReadErr("follower tree iteration failed", err)
	}
	return users, nil
}

func (r *repo) ListFollowedIDs(ctx context.Context, userID string) ([]string, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func() { _ = session.Close(ctx) }()

	result, err := session.Run(ctx,
		`MATCH (me:User {id: $userID})-[:FOLLOWS]->(a:User) RETURN a.id AS authorID`,
		map[string]any{"userID": userID},
	)
	if err != nil {
		return nil, graphReadErr("list followed ids query failed", err)
	}

	var followedIDs []string
	for result.Next(ctx) {
		val, ok := result.Record().Get("authorID")
		if !ok {
			continue
		}
		followedIDs = append(followedIDs, val.(string))
	}
	if err := result.Err(); err != nil {
		return nil, graphReadErr("list followed ids iteration failed", err)
	}
	return followedIDs, nil
}

func (r *repo) IsFollowing(ctx context.Context, followerID string, userIDs []string) (map[string]bool, error) {
	if len(userIDs) == 0 || followerID == "" {
		return nil, nil
	}

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func() { _ = session.Close(ctx) }()

	result, err := session.Run(ctx,
		`MATCH (f:User {id: $followerID})-[:FOLLOWS]->(a:User)
WHERE a.id IN $userIDs
RETURN a.id AS userID`,
		map[string]any{"followerID": followerID, "userIDs": userIDs},
	)
	if err != nil {
		return nil, graphReadErr("is following query failed", err)
	}

	following := make(map[string]bool, len(userIDs))
	for result.Next(ctx) {
		val, ok := result.Record().Get("userID")
		if !ok {
			continue
		}
		following[val.(string)] = true
	}
	if err := result.Err(); err != nil {
		return nil, graphReadErr("is following iteration failed", err)
	}
	return following, nil
}

func (r *repo) FollowersOf(ctx context.Context, userIDs []string) (map[string][]string, error) {
	if len(userIDs) == 0 {
		return nil, nil
	}

	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func() { _ = session.Close(ctx) }()

	result, err := session.Run(ctx,
		`MATCH (follower:User)-[:FOLLOWS]->(u:User)
WHERE u.id IN $userIDs
RETURN u.id AS userID, follower.id AS followerID`,
		map[string]any{"userIDs": userIDs},
	)
	if err != nil {
		return nil, graphReadErr("followers of users query failed", err)
	}

	res := make(map[string][]string)
	for result.Next(ctx) {
		rec := result.Record()
		userID, ok := rec.Get("userID")
		if !ok {
			return nil, graphReadErr("followers of users: missing userID", nil)
		}
		followerID, ok := rec.Get("followerID")
		if !ok {
			return nil, graphReadErr("followers of users: missing followerID", nil)
		}
		res[userID.(string)] = append(res[userID.(string)], followerID.(string))
	}
	if err := result.Err(); err != nil {
		return nil, graphReadErr("followers of users iteration failed", err)
	}
	return res, nil
}

func graphReadErr(msg string, err error) error {
	serviceMsg := fmt.Sprintf("graphread repo: %s", msg)
	if err != nil {
		serviceMsg = fmt.Sprintf("graphread repo: %s: %v", msg, err)
	}
	return &toddlerr.Error{
		PublicStatusCode:  status.ServerError,
		ServiceStatusCode: status.ServerError,
		PublicMessage:     "something went wrong",
		ServiceMessage:    serviceMsg,
	}
}
