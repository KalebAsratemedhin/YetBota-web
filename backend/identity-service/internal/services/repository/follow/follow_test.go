package follow

import (
	"testing"

	domainFollow "github.com/beka-birhanu/yetbota/identity-service/internal/domain/follow"
)

func TestPaginationParams(t *testing.T) {
	cases := []struct {
		name      string
		in        *domainFollow.Pagination
		wantSkip  int
		wantLimit int
	}{
		{"nil", nil, 0, 100},
		{"zero values", &domainFollow.Pagination{}, 0, 100},
		{"non-positive limit", &domainFollow.Pagination{Page: 2, Limit: 0}, 0, 100},
		{"valid", &domainFollow.Pagination{Page: 2, Limit: 10}, 10, 10},
		{"first page", &domainFollow.Pagination{Page: 1, Limit: 25}, 0, 25},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			skip, limit := paginationParams(c.in)
			if skip != c.wantSkip || limit != c.wantLimit {
				t.Fatalf("got (skip=%d, limit=%d), want (skip=%d, limit=%d)", skip, limit, c.wantSkip, c.wantLimit)
			}
		})
	}
}
