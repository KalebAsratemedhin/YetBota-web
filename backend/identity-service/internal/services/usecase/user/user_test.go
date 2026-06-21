package user

import (
	"testing"

	"github.com/beka-birhanu/yetbota/identity-service/drivers/dbmodels"
)

func TestNormalizePhone(t *testing.T) {
	got, err := normalizePhone("+251911223344")
	if err != nil {
		t.Fatalf("valid number errored: %v", err)
	}
	if got != "+251911223344" {
		t.Fatalf("E164 = %q, want +251911223344", got)
	}
	if _, err := normalizePhone("+251123"); err == nil {
		t.Fatal("expected error for invalid number")
	}
}

func TestApplyUserSelfUpdate(t *testing.T) {
	u := &dbmodels.User{FirstName: "old-first", LastName: "old-last", Username: "old-user"}
	applyUserSelfUpdate(u, &UpdateSelfRequest{FirstName: "new-first", Username: "new-user"})

	if u.FirstName != "new-first" {
		t.Fatalf("FirstName = %q, want new-first", u.FirstName)
	}
	if u.LastName != "old-last" {
		t.Fatalf("LastName = %q, empty req field should not override", u.LastName)
	}
	if u.Username != "new-user" {
		t.Fatalf("Username = %q, want new-user", u.Username)
	}
}

func TestUpdateSelfRequestNormalize(t *testing.T) {
	r := &UpdateSelfRequest{Username: "ALICE"}
	if err := r.normalize(); err != nil {
		t.Fatalf("normalize error: %v", err)
	}
	if r.Username != "alice" {
		t.Fatalf("Username = %q, want alice", r.Username)
	}
}

func TestPickPhotoURL(t *testing.T) {
	if got := pickPhotoURL(nil, PhotoResolutionMobile); got != "" {
		t.Fatalf("nil photo: got %q, want empty", got)
	}

	full := &dbmodels.Photo{URL: "orig.jpg"}
	full.URLMobile.SetValid("mobile.jpg")
	full.URLWeb.SetValid("web.jpg")
	if got := pickPhotoURL(full, PhotoResolutionMobile); got != "mobile.jpg" {
		t.Fatalf("mobile: got %q", got)
	}
	if got := pickPhotoURL(full, PhotoResolutionWeb); got != "web.jpg" {
		t.Fatalf("web: got %q", got)
	}
	if got := pickPhotoURL(full, PhotoResolutionOriginal); got != "orig.jpg" {
		t.Fatalf("original: got %q", got)
	}

	noMobile := &dbmodels.Photo{URL: "orig.jpg"}
	noMobile.URLWeb.SetValid("web.jpg")
	if got := pickPhotoURL(noMobile, PhotoResolutionMobile); got != "web.jpg" {
		t.Fatalf("mobile fallthrough to web: got %q", got)
	}

	onlyOrig := &dbmodels.Photo{URL: "orig.jpg"}
	if got := pickPhotoURL(onlyOrig, PhotoResolutionMobile); got != "orig.jpg" {
		t.Fatalf("mobile fallthrough to original: got %q", got)
	}
}
