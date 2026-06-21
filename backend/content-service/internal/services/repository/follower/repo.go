package follower

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/content-service/drivers/validator"
	domainFollower "github.com/beka-birhanu/yetbota/content-service/internal/domain/follower"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type repository struct {
	driver neo4j.DriverWithContext
	db     *sql.DB
}

type Config struct {
	Driver neo4j.DriverWithContext `validate:"required"`
	DB     *sql.DB                 `validate:"required"`
}

func (c *Config) Validate() error {
	return validator.Validate.Struct(c)
}

func NewRepo(c *Config) (domainFollower.Repository, error) {
	if err := c.Validate(); err != nil {
		return nil, err
	}
	return &repository{driver: c.Driver, db: c.DB}, nil
}

func (r *repository) FollowerTree(ctx context.Context, authorID string, maxDepth int) ([]domainFollower.UserWithDepth, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func() { _ = session.Close(ctx) }()

	result, err := session.Run(ctx,
		fmt.Sprintf(`MATCH path = (follower:User)-[:FOLLOWS*1..%d]->(author:User {id: $authorID})
RETURN follower.id AS userID, min(length(path)) AS depth`, maxDepth),
		map[string]any{"authorID": authorID},
	)
	if err != nil {
		return nil, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: follower tree query failed: %v", err),
		}
	}

	var users []domainFollower.UserWithDepth
	for result.Next(ctx) {
		rec := result.Record()
		userID, ok := rec.Get("userID")
		if !ok {
			return nil, &toddlerr.Error{
				PublicStatusCode:  status.ServerError,
				ServiceStatusCode: status.ServerError,
				PublicMessage:     "something went wrong",
				ServiceMessage:    "follower repo: follower tree: missing userID in record",
			}
		}
		depth, ok := rec.Get("depth")
		if !ok {
			return nil, &toddlerr.Error{
				PublicStatusCode:  status.ServerError,
				ServiceStatusCode: status.ServerError,
				PublicMessage:     "something went wrong",
				ServiceMessage:    "follower repo: follower tree: missing depth in record",
			}
		}
		users = append(users, domainFollower.UserWithDepth{
			UserID: userID.(string),
			Depth:  int(depth.(int64)),
		})
	}
	if err := result.Err(); err != nil {
		return nil, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: follower tree iteration failed: %v", err),
		}
	}
	return users, nil
}

// CountFollowers reads the pre-maintained followers counter from Postgres — O(1) index lookup.
func (r *repository) CountFollowers(ctx context.Context, authorID string) (int64, error) {
	var count int64
	err := r.db.QueryRowContext(ctx, `SELECT followers FROM users WHERE id = $1`, authorID).Scan(&count)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	if err != nil {
		return 0, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: count followers failed: %v", err),
		}
	}
	return count, nil
}

// ListCelebrityFollows returns IDs of accounts userID follows whose follower count exceeds threshold.
// Step 1: fetch followed account IDs from Neo4j (cheap — one hop from userID).
// Step 2: filter by Postgres users.followers > threshold (index scan, no edge traversal).
func (r *repository) ListCelebrityFollows(ctx context.Context, userID string, threshold int64) ([]string, error) {
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func() { _ = session.Close(ctx) }()

	result, err := session.Run(ctx,
		`MATCH (me:User {id: $userID})-[:FOLLOWS]->(a:User) RETURN a.id AS authorID`,
		map[string]any{"userID": userID},
	)
	if err != nil {
		return nil, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: list follows query failed: %v", err),
		}
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
		return nil, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: list follows iteration failed: %v", err),
		}
	}
	if len(followedIDs) == 0 {
		return nil, nil
	}

	placeholders := make([]string, len(followedIDs))
	args := make([]any, len(followedIDs)+1)
	args[0] = threshold
	for i, id := range followedIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args[i+1] = id
	}
	query := fmt.Sprintf(
		`SELECT id FROM users WHERE followers > $1 AND id IN (%s)`,
		strings.Join(placeholders, ","),
	)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: filter celebrities failed: %v", err),
		}
	}
	defer func() { _ = rows.Close() }()

	var celebIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, &toddlerr.Error{
				PublicStatusCode:  status.ServerError,
				ServiceStatusCode: status.ServerError,
				PublicMessage:     "something went wrong",
				ServiceMessage:    fmt.Sprintf("follower repo: scan celebrity id failed: %v", err),
			}
		}
		celebIDs = append(celebIDs, id)
	}
	return celebIDs, rows.Err()
}

func (r *repository) IsFollowing(ctx context.Context, followerID string, userIDs []string) (map[string]bool, error) {
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
		return nil, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: is following query failed: %v", err),
		}
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
		return nil, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: is following iteration failed: %v", err),
		}
	}
	return following, nil
}

func (r *repository) FollowersOf(ctx context.Context, userIDs []string) (map[string][]string, error) {
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
		return nil, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: followers of users query failed: %v", err),
		}
	}

	res := make(map[string][]string)
	for result.Next(ctx) {
		rec := result.Record()
		userID, ok := rec.Get("userID")
		if !ok {
			return nil, &toddlerr.Error{
				PublicStatusCode:  status.ServerError,
				ServiceStatusCode: status.ServerError,
				PublicMessage:     "something went wrong",
				ServiceMessage:    "follower repo: followers of users: missing userID in record",
			}
		}
		followerID, ok := rec.Get("followerID")
		if !ok {
			return nil, &toddlerr.Error{
				PublicStatusCode:  status.ServerError,
				ServiceStatusCode: status.ServerError,
				PublicMessage:     "something went wrong",
				ServiceMessage:    "follower repo: followers of users: missing followerID in record",
			}
		}
		res[userID.(string)] = append(res[userID.(string)], followerID.(string))
	}
	if err := result.Err(); err != nil {
		return nil, &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerError,
			PublicMessage:     "something went wrong",
			ServiceMessage:    fmt.Sprintf("follower repo: followers of users iteration failed: %v", err),
		}
	}
	return res, nil
}
