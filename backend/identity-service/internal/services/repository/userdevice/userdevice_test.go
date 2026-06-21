package userdevice

import (
	"testing"

	domainUserDevice "github.com/beka-birhanu/yetbota/identity-service/internal/domain/userdevice"
)

func TestBuildQueryMods(t *testing.T) {
	if got := buildQueryMods(nil); len(got) != 0 {
		t.Fatalf("nil opts: %d mods, want 0", len(got))
	}
	if got := buildQueryMods(&domainUserDevice.Options{}); len(got) != 0 {
		t.Fatalf("empty opts: %d mods, want 0", len(got))
	}
	if got := buildQueryMods(&domainUserDevice.Options{UserIDs: []string{"u1"}}); len(got) != 1 {
		t.Fatalf("UserIDs: %d mods, want 1", len(got))
	}
	if got := buildQueryMods(&domainUserDevice.Options{DeviceIDs: []string{"d1"}}); len(got) != 1 {
		t.Fatalf("DeviceIDs: %d mods, want 1", len(got))
	}
	if got := buildQueryMods(&domainUserDevice.Options{UserIDs: []string{"u1"}, DeviceIDs: []string{"d1"}}); len(got) != 2 {
		t.Fatalf("both: %d mods, want 2", len(got))
	}
}

func TestBuildPaginationMods(t *testing.T) {
	if got := buildPaginationMods(nil); len(got) != 0 {
		t.Fatalf("nil: %d mods, want 0", len(got))
	}
	if got := buildPaginationMods(&domainUserDevice.Pagination{Limit: 10, Page: 2}); len(got) != 2 {
		t.Fatalf("valid: %d mods, want 2", len(got))
	}
}

func TestBuildSortMods(t *testing.T) {
	// nil/empty falls back to a default ORDER BY created_at DESC => one mod.
	if got := buildSortMods(nil); len(got) != 1 {
		t.Fatalf("nil sort: %d mods, want 1 default", len(got))
	}
	got := buildSortMods(&domainUserDevice.SortOption{
		Field:     domainUserDevice.SortFieldCreatedAt,
		Direction: domainUserDevice.SortDirectionAsc,
	})
	if len(got) != 1 {
		t.Fatalf("explicit sort: %d mods, want 1", len(got))
	}
}
