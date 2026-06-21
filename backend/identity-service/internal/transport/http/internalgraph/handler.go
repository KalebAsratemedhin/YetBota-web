package internalgraph

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/identity-service/drivers/middleware"
	repoGraphRead "github.com/beka-birhanu/yetbota/identity-service/internal/services/repository/graphread"
)

type Config struct {
	Repo         repoGraphRead.Repository
	ServiceToken string
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

func NewHandler(cfg *Config) http.Handler {
	mux := http.NewServeMux()
	if cfg == nil || cfg.Repo == nil {
		return mux
	}

	auth := middleware.InternalAuth(cfg.ServiceToken)
	mux.Handle("GET /follower-tree", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorID := strings.TrimSpace(r.URL.Query().Get("author_id"))
		if authorID == "" {
			writeError(w, int(status.BadRequest), "author_id is required")
			return
		}
		maxDepth, err := parsePositiveInt(r.URL.Query().Get("max_depth"), 2)
		if err != nil {
			writeError(w, int(status.BadRequest), err.Error())
			return
		}

		users, err := cfg.Repo.FollowerTree(r.Context(), authorID, maxDepth)
		if err != nil {
			writeRepoError(w, err)
			return
		}

		out := make([]userWithDepthResponse, 0, len(users))
		for _, u := range users {
			out = append(out, userWithDepthResponse{UserID: u.UserID, Depth: u.Depth})
		}
		writeJSON(w, http.StatusOK, followerTreeResponse{Users: out})
	})))

	mux.Handle("GET /followed-ids", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := strings.TrimSpace(r.URL.Query().Get("user_id"))
		if userID == "" {
			writeError(w, int(status.BadRequest), "user_id is required")
			return
		}

		ids, err := cfg.Repo.ListFollowedIDs(r.Context(), userID)
		if err != nil {
			writeRepoError(w, err)
			return
		}
		if ids == nil {
			ids = []string{}
		}
		writeJSON(w, http.StatusOK, followedIDsResponse{UserIDs: ids})
	})))

	mux.Handle("GET /is-following", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		followerID := strings.TrimSpace(r.URL.Query().Get("follower_id"))
		if followerID == "" {
			writeError(w, int(status.BadRequest), "follower_id is required")
			return
		}
		userIDs := splitCSV(r.URL.Query().Get("user_ids"))
		if len(userIDs) == 0 {
			writeJSON(w, http.StatusOK, isFollowingResponse{Following: map[string]bool{}})
			return
		}

		following, err := cfg.Repo.IsFollowing(r.Context(), followerID, userIDs)
		if err != nil {
			writeRepoError(w, err)
			return
		}
		if following == nil {
			following = map[string]bool{}
		}
		writeJSON(w, http.StatusOK, isFollowingResponse{Following: following})
	})))

	mux.Handle("GET /followers-of", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userIDs := splitCSV(r.URL.Query().Get("user_ids"))
		if len(userIDs) == 0 {
			writeJSON(w, http.StatusOK, followersOfResponse{Followers: map[string][]string{}})
			return
		}

		followers, err := cfg.Repo.FollowersOf(r.Context(), userIDs)
		if err != nil {
			writeRepoError(w, err)
			return
		}
		if followers == nil {
			followers = map[string][]string{}
		}
		writeJSON(w, http.StatusOK, followersOfResponse{Followers: followers})
	})))

	return mux
}

func parsePositiveInt(raw string, defaultVal int) (int, error) {
	if strings.TrimSpace(raw) == "" {
		return defaultVal, nil
	}
	n, err := strconv.Atoi(raw)
	if err != nil || n < 1 {
		return 0, errInvalidInt("max_depth")
	}
	return n, nil
}

func errInvalidInt(field string) error {
	return &toddlerr.Error{
		PublicStatusCode:  status.BadRequest,
		ServiceStatusCode: status.BadRequest,
		PublicMessage:     field + " must be a positive integer",
		ServiceMessage:    field + " must be a positive integer",
	}
}

func splitCSV(raw string) []string {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}

func writeJSON(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, code int, message string) {
	writeJSON(w, code, map[string]string{"error": message})
}

func writeRepoError(w http.ResponseWriter, err error) {
	if te, ok := err.(*toddlerr.Error); ok {
		writeJSON(w, int(te.PublicStatusCode), map[string]string{"error": te.PublicMessage})
		return
	}
	writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "something went wrong"})
}
