package moderation

import (
	"errors"
	"strings"
	"testing"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
)

func TestSnippet(t *testing.T) {
	if got := snippet("short"); got != "short" {
		t.Fatalf("short string changed: %q", got)
	}

	exact := strings.Repeat("a", 140)
	if got := snippet(exact); got != exact {
		t.Fatalf("140-rune string should be unchanged, got len %d", len([]rune(got)))
	}

	long := strings.Repeat("b", 200)
	got := snippet(long)
	if !strings.HasSuffix(got, "...") {
		t.Fatalf("truncated string should end with ellipsis: %q", got)
	}
	if r := []rune(got); len(r) != 143 {
		t.Fatalf("truncated length = %d runes, want 143 (140 + \"...\")", len(r))
	}
}

func TestErrorConstructors(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want status.StatusCode
	}{
		{"badRequest", badRequest("x"), status.BadRequest},
		{"conflict", conflict("x"), status.Conflict},
		{"serverError", serverError("x"), status.ServerError},
		{"notFound", notFound("x"), status.NotFound},
		{"tooManyRequests", tooManyRequests("x"), statusTooManyRequests},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			var te *toddlerr.Error
			if !errors.As(c.err, &te) {
				t.Fatalf("not a *toddlerr.Error: %v", c.err)
			}
			if te.PublicStatusCode != c.want {
				t.Fatalf("PublicStatusCode = %d, want %d", te.PublicStatusCode, c.want)
			}
		})
	}
}
