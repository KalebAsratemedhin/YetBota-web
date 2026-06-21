package feed

import (
	"math"
	"testing"

	feedDomain "github.com/beka-birhanu/yetbota/content-service/internal/domain/feed"
)

func TestFormatFloat(t *testing.T) {
	if got := formatFloat(math.Inf(1)); got != "+inf" {
		t.Fatalf("+Inf: got %q", got)
	}
	if got := formatFloat(math.Inf(-1)); got != "-inf" {
		t.Fatalf("-Inf: got %q", got)
	}
	if got := formatFloat(12.5); got != "12.5" {
		t.Fatalf("12.5: got %q", got)
	}
	if got := formatFloat(0); got != "0" {
		t.Fatalf("0: got %q", got)
	}
}

func TestMapListOptionsDefaults(t *testing.T) {
	r := &RedisRepository{}
	z := r.mapListOptions(nil)
	if z.Min != "-inf" || z.Max != "+inf" {
		t.Fatalf("default bounds: got Min=%q Max=%q", z.Min, z.Max)
	}
	if z.Count != 50 {
		t.Fatalf("default count = %d, want 50", z.Count)
	}
	if z.Offset != 0 {
		t.Fatalf("offset = %d, want 0", z.Offset)
	}
}

func TestMapListOptionsValues(t *testing.T) {
	r := &RedisRepository{}
	z := r.mapListOptions(&feedDomain.ListOptions{MinScore: 1.5, MaxScore: 9.5, Limit: 10})
	if z.Min != "1.5" || z.Max != "9.5" {
		t.Fatalf("bounds: got Min=%q Max=%q", z.Min, z.Max)
	}
	if z.Count != 10 {
		t.Fatalf("count = %d, want 10", z.Count)
	}
}

func TestRedisKeys(t *testing.T) {
	r := &RedisRepository{prefix: "feed"}
	if got := r.key("u1"); got != "feed:u1" {
		t.Fatalf("key: got %q", got)
	}
	if got := r.celebrityKey("a1"); got != "feed:CELEBRITY:a1" {
		t.Fatalf("celebrityKey: got %q", got)
	}
	if got := r.recipientsKey("p1"); got != "feed:RECIPIENTS:p1" {
		t.Fatalf("recipientsKey: got %q", got)
	}
	if got := r.postScoreKey("p1"); got != "feed:SCORE:p1" {
		t.Fatalf("postScoreKey: got %q", got)
	}
}
