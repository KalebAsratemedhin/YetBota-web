package aigraph

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
	domainPostSim "github.com/beka-birhanu/yetbota/content-service/internal/domain/postsimilarity"
)

const internalTokenHeader = "X-Internal-Token"

type Client interface {
	SimilarPostsTree(ctx context.Context, postID string, maxDepth int) ([]domainPostSim.PostWithDepth, error)
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

func (c *client) SimilarPostsTree(ctx context.Context, postID string, maxDepth int) ([]domainPostSim.PostWithDepth, error) {
	query := url.Values{}
	query.Set("post_id", postID)
	query.Set("max_depth", strconv.Itoa(maxDepth))

	var resp similarPostsTreeResponse
	if err := c.getJSON(ctx, "/v1/internal/graph/similar-posts-tree", query, &resp); err != nil {
		return nil, err
	}

	out := make([]domainPostSim.PostWithDepth, 0, len(resp.Posts))
	for _, p := range resp.Posts {
		out = append(out, domainPostSim.PostWithDepth{PostID: p.PostID, Depth: p.Depth})
	}
	return out, nil
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
	serviceMsg := fmt.Sprintf("aigraph client: %s", msg)
	if err != nil {
		serviceMsg = fmt.Sprintf("aigraph client: %s: %v", msg, err)
	}
	return &toddlerr.Error{
		PublicStatusCode:  status.ServerError,
		ServiceStatusCode: status.ServerError,
		PublicMessage:     "something went wrong",
		ServiceMessage:    serviceMsg,
	}
}

type postWithDepthResponse struct {
	PostID string `json:"post_id"`
	Depth  int    `json:"depth"`
}

type similarPostsTreeResponse struct {
	Posts []postWithDepthResponse `json:"posts"`
}
