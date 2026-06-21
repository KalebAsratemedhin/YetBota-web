package processors

import (
	"math"
	"testing"

	"github.com/beka-birhanu/yetbota/content-service/drivers/config"
	"github.com/beka-birhanu/yetbota/content-service/drivers/dbmodels"
)

func approx(a, b float64) bool { return math.Abs(a-b) < 1e-6 }

// author scoring

func TestEngagementScore(t *testing.T) {
	if got := engagementScore(&dbmodels.Post{}); got != 0 {
		t.Fatalf("no engagement: got %v, want 0", got)
	}
	if got := engagementScore(&dbmodels.Post{Dislikes: 5}); got != 0 {
		t.Fatalf("negative raw should clamp to 0, got %v", got)
	}
	// raw = 10*2 = 20, log2(21)
	if got := engagementScore(&dbmodels.Post{Likes: 10}); !approx(got, math.Log2(21)) {
		t.Fatalf("got %v, want %v", got, math.Log2(21))
	}
}

func TestImpliedRating(t *testing.T) {
	if got := impliedRating(0); got != 1100 {
		t.Fatalf("zero engagement: got %v, want 1100", got)
	}
	if got := impliedRating(4); !approx(got, 1500+400*2) {
		t.Fatalf("engagement 4: got %v, want 2300", got)
	}
}

func TestKFactor(t *testing.T) {
	cases := []struct {
		count int64
		want  float64
	}{
		{0, 32}, {30, 32}, {31, 16}, {100, 16}, {101, 8}, {5000, 8},
	}
	for _, c := range cases {
		if got := kFactor(c.count); got != c.want {
			t.Fatalf("kFactor(%d) = %v, want %v", c.count, got, c.want)
		}
	}
}

func TestComputeNewScoreNoEngagement(t *testing.T) {
	// engagement 0 -> implied 1100; current already 1100 -> no change.
	if got := computeNewScore(1100, &dbmodels.Post{}, 10); got != 1100 {
		t.Fatalf("got %d, want 1100", got)
	}
}

func TestComputeNewScoreIncreasesOnPositive(t *testing.T) {
	got := computeNewScore(1000, &dbmodels.Post{Likes: 50, CommentCount: 10}, 10)
	if got <= 1000 {
		t.Fatalf("strong engagement should raise score, got %d", got)
	}
}

func TestApplyEarnedBadges(t *testing.T) {
	user := &dbmodels.User{Score: 1500}
	badges := []config.Badge{
		{Name: "bronze", MinScore: 1000},
		{Name: "silver", MinScore: 1500},
		{Name: "gold", MinScore: 2000},
	}

	applyEarnedBadges(user, badges)
	if len(user.Badges) != 2 {
		t.Fatalf("expected bronze+silver, got %v", user.Badges)
	}

	// idempotent: re-applying must not duplicate.
	applyEarnedBadges(user, badges)
	if len(user.Badges) != 2 {
		t.Fatalf("re-apply duplicated badges: %v", user.Badges)
	}
}

// feed update

func TestWilsonLowerBound(t *testing.T) {
	if got := wilsonLowerBound(0, 0); got != 0 {
		t.Fatalf("no votes: got %v, want 0", got)
	}

	small := wilsonLowerBound(10, 0)
	if small <= 0 || small >= 1 {
		t.Fatalf("expected lower bound in (0,1), got %v", small)
	}
	// more samples at the same 100%% ratio -> higher lower bound.
	large := wilsonLowerBound(100, 0)
	if large <= small {
		t.Fatalf("expected %v > %v with more samples", large, small)
	}
}

func TestDistanceAttenuation(t *testing.T) {
	if got := distanceAttenuation(1); got != 0 {
		t.Fatalf("depth 1: got %v, want 0", got)
	}
	if got := distanceAttenuation(2); got != -1 {
		t.Fatalf("depth 2: got %v, want -1", got)
	}
	if got := distanceAttenuation(4); got != -2 {
		t.Fatalf("depth 4: got %v, want -2", got)
	}
}

func TestComputeMaxDepth(t *testing.T) {
	a := &feedUpdateActivity{minFeedScore: 0}

	if got := (&feedUpdateActivity{minFeedScore: 5}).computeMaxDepth(3); got != 0 {
		t.Fatalf("below minFeedScore: got %d, want 0", got)
	}
	if got := a.computeMaxDepth(0); got != 1 {
		t.Fatalf("diff 0: got %d, want 1 (2^0)", got)
	}
	if got := a.computeMaxDepth(3); got != 8 {
		t.Fatalf("diff 3: got %d, want 8 (2^3)", got)
	}
	if got := a.computeMaxDepth(11); got != 1000 {
		t.Fatalf("diff >=10: got %d, want capped 1000", got)
	}
}

func TestComputePostScore(t *testing.T) {
	a := &feedUpdateActivity{seedBonus: 1, qScale: 1, epoch: 0, halfLifeHours: 1}
	// no votes -> q=0 -> qComp=log2(max(0,1))=0; tComp=3600/3600=1; total=seedBonus+0+1=2.
	if got := a.computePostScore(0, 0, 3600); !approx(got, 2) {
		t.Fatalf("got %v, want 2", got)
	}
}
