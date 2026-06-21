package feed

import (
	"errors"
	"testing"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/content-service/drivers/dbmodels"
	feedDomain "github.com/beka-birhanu/yetbota/content-service/internal/domain/feed"
)

func item(id string, score float64) *feedDomain.FeedItem {
	return &feedDomain.FeedItem{PostID: id, Score: score}
}

func TestMergeByScore(t *testing.T) {
	a := []*feedDomain.FeedItem{item("a1", 9), item("a2", 5), item("a3", 1)}
	b := []*feedDomain.FeedItem{item("b1", 8), item("b2", 6)}

	merged := mergeByScore(a, b)
	if len(merged) != 5 {
		t.Fatalf("len = %d, want 5", len(merged))
	}
	for i := 1; i < len(merged); i++ {
		if merged[i-1].Score < merged[i].Score {
			t.Fatalf("not score-descending at %d: %v", i, merged)
		}
	}
	wantOrder := []string{"a1", "b1", "b2", "a2", "a3"}
	for i, id := range wantOrder {
		if merged[i].PostID != id {
			t.Fatalf("position %d = %s, want %s", i, merged[i].PostID, id)
		}
	}
}

func TestMergeByScoreEmpty(t *testing.T) {
	a := []*feedDomain.FeedItem{item("a1", 1)}
	if got := mergeByScore(a, nil); len(got) != 1 || got[0].PostID != "a1" {
		t.Fatalf("merge with empty b: %v", got)
	}
	if got := mergeByScore(nil, nil); len(got) != 0 {
		t.Fatalf("merge of empties should be empty, got %v", got)
	}
}

func TestOrderPosts(t *testing.T) {
	unordered := []*dbmodels.Post{{ID: "p3"}, {ID: "p1"}, {ID: "p2"}}
	ids := []string{"p1", "p2", "p3"}

	ordered := orderPosts(unordered, ids)
	if len(ordered) != 3 {
		t.Fatalf("len = %d, want 3", len(ordered))
	}
	for i, id := range ids {
		if ordered[i].ID != id {
			t.Fatalf("position %d = %s, want %s", i, ordered[i].ID, id)
		}
	}
}

func TestOrderPostsDropsMissing(t *testing.T) {
	unordered := []*dbmodels.Post{{ID: "p1"}}
	ordered := orderPosts(unordered, []string{"p1", "missing"})
	if len(ordered) != 1 || ordered[0].ID != "p1" {
		t.Fatalf("expected only p1, got %v", ordered)
	}
}

func TestGroupPhotosByPost(t *testing.T) {
	photos := dbmodels.PostPhotoSlice{
		{PostID: "p1", PhotoID: "ph1", Position: 0},
		{PostID: "p1", PhotoID: "ph2", Position: 1},
		{PostID: "p2", PhotoID: "ph3", Position: 0},
	}
	grouped := groupPhotosByPost(photos)
	if len(grouped) != 2 {
		t.Fatalf("expected 2 posts, got %d", len(grouped))
	}
	if len(grouped["p1"]) != 2 {
		t.Fatalf("p1 should have 2 photos, got %d", len(grouped["p1"]))
	}
	if grouped["p1"][0].ID != "ph1" || grouped["p1"][1].ID != "ph2" {
		t.Fatalf("p1 photo order/ids wrong: %+v", grouped["p1"])
	}
	if grouped["p1"][0].URL != "" {
		t.Fatalf("expected empty URL when relation not loaded, got %q", grouped["p1"][0].URL)
	}
}

func TestBuildNextCursor(t *testing.T) {
	if got := buildNextCursor(nil); got != "" {
		t.Fatalf("nil item: got %q, want empty", got)
	}
	if got := buildNextCursor(item("p1", 12.5)); got != "cursor:12.5" {
		t.Fatalf("got %q, want cursor:12.5", got)
	}
}

func TestParseCursor(t *testing.T) {
	if got, err := parseCursor(""); err != nil || got != 0 {
		t.Fatalf("empty cursor: got (%v, %v), want (0, nil)", got, err)
	}
	if got, err := parseCursor("cursor:12.5"); err != nil || got != 12.5 {
		t.Fatalf("valid cursor: got (%v, %v), want (12.5, nil)", got, err)
	}

	_, err := parseCursor("cursor:notanumber")
	if err == nil {
		t.Fatal("expected error for invalid cursor")
	}
	var te *toddlerr.Error
	if !errors.As(err, &te) || te.PublicStatusCode != status.BadRequest {
		t.Fatalf("expected BadRequest error, got %v", err)
	}
}

func TestSeenFeedKey(t *testing.T) {
	if got := seenFeedKey("u1", "p1"); got != "u1:p1" {
		t.Fatalf("got %q, want u1:p1", got)
	}
}
