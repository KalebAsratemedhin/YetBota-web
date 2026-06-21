package postphoto

import (
	"testing"

	"github.com/beka-birhanu/yetbota/content-service/internal/domain/postphoto"
)

func TestBuildQueryMods(t *testing.T) {
	if got := buildQueryMods(nil); len(got) != 0 {
		t.Fatalf("nil opts: %d mods, want 0", len(got))
	}
	if got := buildQueryMods(&postphoto.Options{}); len(got) != 0 {
		t.Fatalf("empty opts: %d mods, want 0", len(got))
	}
	if got := buildQueryMods(&postphoto.Options{LoadPhoto: true}); len(got) != 1 {
		t.Fatalf("LoadPhoto: %d mods, want 1", len(got))
	}
	if got := buildQueryMods(&postphoto.Options{PostIDs: []string{"p1"}}); len(got) != 1 {
		t.Fatalf("PostIDs: %d mods, want 1", len(got))
	}
	if got := buildQueryMods(&postphoto.Options{LoadPhoto: true, PostIDs: []string{"p1", "p2"}}); len(got) != 2 {
		t.Fatalf("LoadPhoto+PostIDs: %d mods, want 2", len(got))
	}
}
