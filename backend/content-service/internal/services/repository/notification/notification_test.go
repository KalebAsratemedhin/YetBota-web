package notification

import (
	"testing"

	dmn "github.com/beka-birhanu/yetbota/content-service/internal/domain/notification"
)

func TestPaginationOffset(t *testing.T) {
	cases := []struct {
		page, length int32
		want         int
	}{
		{1, 15, 0},
		{2, 15, 15},
		{3, 10, 20},
	}
	for _, c := range cases {
		if got := paginationOffset(c.page, c.length); got != c.want {
			t.Fatalf("paginationOffset(%d, %d) = %d, want %d", c.page, c.length, got, c.want)
		}
	}
}

func TestBuildQuery(t *testing.T) {
	if got := buildQuery(&dmn.Filter{}); len(got) != 0 {
		t.Fatalf("empty filter: %d mods, want 0", len(got))
	}
	if got := buildQuery(&dmn.Filter{UserID: "u1"}); len(got) != 1 {
		t.Fatalf("user filter: %d mods, want 1", len(got))
	}
	if got := buildQuery(&dmn.Filter{Unread: true}); len(got) != 1 {
		t.Fatalf("unread filter: %d mods, want 1", len(got))
	}
	if got := buildQuery(&dmn.Filter{UserID: "u1", Unread: true}); len(got) != 2 {
		t.Fatalf("combined filter: %d mods, want 2", len(got))
	}
}
