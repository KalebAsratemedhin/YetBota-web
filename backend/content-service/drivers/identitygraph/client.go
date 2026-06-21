package identitygraph

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/content-service/drivers/validator"
	domainFollower "github.com/beka-birhanu/yetbota/content-service/internal/domain/follower"
)

const internalTokenHeader = "X-Internal-Token"

type Client interface {
	FollowerTree(ctx context.Context, authorID string, maxDepth int) ([]domainFollower.UserWithDepth, error)
	ListFollowedIDs(ctx context.Context, userID string) ([]string, error)
	IsFollowing(ctx context.Context, followerID string, userIDs []string) (map[string]bool, error)
	FollowersOf(ctx context.Context, userIDs []string) (map[string][]string, error)
}

type Config struct {
	BaseURL      string        `validate:"required"`
	ServiceToken string        `validate:"required"`
	Timeout      time.Duration `validate:"required"`
}

func (c *Config) Validate() error {
	return validator.Validate.Struct(c)
}

type client struct {
	baseURL      string
	serviceToken string
	httpClient   *http.Client
}

func NewClient(c *Config) (Client, error) {
	if err := c.Validate(); err != nil {
		return nil, err
	}
	return &client{
		baseURL:      strings.TrimRight(c.BaseURL, "/"),
		serviceToken: c.ServiceToken,
		httpClient:   &http.Client{Timeout: c.Timeout},
	}, nil
}

func (c *client) FollowerTree(ctx context.Context, authorID string, maxDepth int) ([]domainFollower.UserWithDepth, error) {
	query := url.Values{}
	query.Set("author_id", authorID)
	query.Set("max_depth", strconv.Itoa(maxDepth))

	var resp followerTreeResponse
	if err := c.getJSON(ctx, "/v1/internal/graph/follower-tree", query, &resp); err != nil {
		return nil, err
	}

	out := make([]domainFollower.UserWithDepth, 0, len(resp.Users))
	for _, u := range resp.Users {
		out = append(out, domainFollower.UserWithDepth{UserID: u.UserID, Depth: u.Depth})
	}
	return out, nil
}

func (c *client) ListFollowedIDs(ctx context.Context, userID string) ([]string, error) {
	query := url.Values{}
	query.Set("user_id", userID)

	var resp followedIDsResponse
	if err := c.getJSON(ctx, "/v1/internal/graph/followed-ids", query, &resp); err != nil {
		return nil, err
	}
	return resp.UserIDs, nil
}

func (c *client) IsFollowing(ctx context.Context, followerID string, userIDs []string) (map[string]bool, error) {
	if len(userIDs) == 0 || followerID == "" {
		return nil, nil
	}

	query := url.Values{}
	query.Set("follower_id", followerID)
	query.Set("user_ids", strings.Join(userIDs, ","))

	var resp isFollowingResponse
	if err := c.getJSON(ctx, "/v1/internal/graph/is-following", query, &resp); err != nil {
		return nil, err
	}
	return resp.Following, nil
}

func (c *client) FollowersOf(ctx context.Context, userIDs []string) (map[string][]string, error) {
	if len(userIDs) == 0 {
		return nil, nil
	}

	query := url.Values{}
	query.Set("user_ids", strings.Join(userIDs, ","))

	var resp followersOfResponse
	if err := c.getJSON(ctx, "/v1/internal/graph/followers-of", query, &resp); err != nil {
		return nil, err
	}
	return resp.Followers, nil
}

func (c *client) getJSON(ctx context.Context, path string, query url.Values, dest any) error {
	endpoint := c.baseURL + path
	if encoded := query.Encode(); encoded != "" {
		endpoint += "?" + encoded
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return clientErr("build request", err)
	}
	req.Header.Set(internalTokenHeader, c.serviceToken)

	res, err := c.httpClient.Do(req)
	if err != nil {
		return clientErr("request failed", err)
	}
	defer func() { _ = res.Body.Close() }()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return clientErr("read response", err)
	}

	if res.StatusCode != http.StatusOK {
		return clientErr(fmt.Sprintf("unexpected status %d", res.StatusCode), nil)
	}

	if err := json.Unmarshal(body, dest); err != nil {
		return clientErr("decode response", err)
	}
	return nil
}

func clientErr(msg string, err error) error {
	serviceMsg := fmt.Sprintf("identitygraph client: %s", msg)
	if err != nil {
		serviceMsg = fmt.Sprintf("identitygraph client: %s: %v", msg, err)
	}
	return &toddlerr.Error{
		PublicStatusCode:  status.ServerError,
		ServiceStatusCode: status.ServerError,
		PublicMessage:     "something went wrong",
		ServiceMessage:    serviceMsg,
	}
}

type userWithDepthResponse struct {
	UserID string `json:"user_id"`
	Depth  int    `json:"depth"`
}

type followerTreeResponse struct {
	Users []userWithDepthResponse `json:"users"`
}

type followedIDsResponse struct {
	UserIDs []string `json:"user_ids"`
}

type isFollowingResponse struct {
	Following map[string]bool `json:"following"`
}

type followersOfResponse struct {
	Followers map[string][]string `json:"followers"`
}
