package post

import (
	"testing"

	domainPost "github.com/beka-birhanu/yetbota/content-service/internal/domain/post"
)

func TestFilterMods(t *testing.T) {
	if got := FilterMods(nil); len(got) != 0 {
		t.Fatalf("nil opts: %d mods, want 0", len(got))
	}
	if got := FilterMods(&domainPost.ListOptions{}); len(got) != 0 {
		t.Fatalf("empty opts: %d mods, want 0", len(got))
	}

	q := true
	opts := &domainPost.ListOptions{
		IDs:         []string{"a", "b"},
		UserID:      "u1",
		Search:      "term",
		IsQuestion:  &q,
		OnlyVisible: true,
		Tags:        []string{"t1"},
	}
	// IDs, UserID, Search, IsQuestion, OnlyVisible, Tags => 6 mods.
	if got := FilterMods(opts); len(got) != 6 {
		t.Fatalf("full opts: %d mods, want 6", len(got))
	}
}

func TestFilterModsNonVisible(t *testing.T) {
	got := FilterMods(&domainPost.ListOptions{NonVisibleOnly: true})
	if len(got) != 1 {
		t.Fatalf("NonVisibleOnly: %d mods, want 1", len(got))
	}
}

func TestSortMods(t *testing.T) {
	if SortMods(nil) != nil {
		t.Fatal("nil opts should yield nil")
	}
	if SortMods(&domainPost.ListOptions{}) != nil {
		t.Fatal("no sort field should yield nil")
	}
	mod := SortMods(&domainPost.ListOptions{
		SortField: domainPost.ListSortFieldCreatedAt,
		SortDir:   domainPost.ListSortDirDesc,
	})
	if mod == nil {
		t.Fatal("expected a sort mod")
	}
}

func TestPaginationMods(t *testing.T) {
	if PaginationMods(nil) != nil {
		t.Fatal("nil opts should yield nil")
	}
	if got := PaginationMods(&domainPost.ListOptions{}); len(got) != 2 {
		t.Fatalf("default pagination: %d mods, want 2 (limit+offset)", len(got))
	}
	if got := PaginationMods(&domainPost.ListOptions{Page: 3, PageSize: 50}); len(got) != 2 {
		t.Fatalf("explicit pagination: %d mods, want 2", len(got))
	}
}
