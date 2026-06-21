package user

import (
	"testing"

	domainUser "github.com/beka-birhanu/yetbota/identity-service/internal/domain/user"
)

func TestBuildQueryMods(t *testing.T) {
	if got := buildQueryMods(nil); len(got) != 0 {
		t.Fatalf("nil opts: %d mods, want 0", len(got))
	}
	if got := buildQueryMods(&domainUser.Options{}); len(got) != 0 {
		t.Fatalf("empty opts: %d mods, want 0", len(got))
	}

	min := int64(100)
	opts := &domainUser.Options{
		FirstName: "f",
		Username:  "u",
		Search:    "term",
		MinScore:  &min,
		LoadPhoto: true,
	}
	// FirstName, Username, Search, MinScore, LoadPhoto => 5 mods.
	if got := buildQueryMods(opts); len(got) != 5 {
		t.Fatalf("got %d mods, want 5", len(got))
	}
}

func TestBuildPaginationMods(t *testing.T) {
	if got := buildPaginationMods(nil); len(got) != 0 {
		t.Fatalf("nil: %d mods, want 0", len(got))
	}
	if got := buildPaginationMods(&domainUser.Pagination{}); len(got) != 0 {
		t.Fatalf("zero values: %d mods, want 0", len(got))
	}
	if got := buildPaginationMods(&domainUser.Pagination{Limit: 10, Page: 2}); len(got) != 2 {
		t.Fatalf("valid: %d mods, want 2 (limit+offset)", len(got))
	}
}

func TestBuildSortMods(t *testing.T) {
	// nil/empty falls back to a default ORDER BY id ASC => one mod.
	if got := buildSortMods(nil); len(got) != 1 {
		t.Fatalf("nil sort: %d mods, want 1 default", len(got))
	}
	got := buildSortMods(&domainUser.SortOption{
		Field:     domainUser.SortFieldRating,
		Direction: domainUser.SortDirectionDesc,
	})
	if len(got) != 1 {
		t.Fatalf("explicit sort: %d mods, want 1", len(got))
	}
}
