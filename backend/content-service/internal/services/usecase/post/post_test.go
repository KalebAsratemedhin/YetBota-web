package post

import (
	"testing"

	"github.com/beka-birhanu/yetbota/content-service/drivers/dbmodels"
)

func TestCloudinaryPublicIDFromURL(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{"empty", "", ""},
		{"raw key passthrough", "folder/image", "folder/image"},
		{"url with version and ext", "https://res.cloudinary.com/demo/image/upload/v1234567/folder/image.jpg", "folder/image"},
		{"url without version", "https://res.cloudinary.com/demo/image/upload/folder/image.png", "folder/image"},
		{"url no upload segment", "https://example.com/some/path.png", "some/path.png"},
		{"url single segment after upload", "https://res.cloudinary.com/demo/image/upload/v1/image.jpg", "image"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := cloudinaryPublicIDFromURL(c.in); got != c.want {
				t.Fatalf("got %q, want %q", got, c.want)
			}
		})
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

func TestPostFromAddReq(t *testing.T) {
	req := &AddRequest{
		Title:          "t",
		Description:    "d",
		Tags:           []string{"a", "b"},
		IsQuestion:     true,
		Address:        "addr",
		AttachedPostID: "att-1",
	}
	p := postFromAddReq(req)

	if p.Title != "t" || p.Description != "d" || !p.IsQuestion {
		t.Fatalf("scalar fields not mapped: %+v", p)
	}
	if len(p.Tags) != 2 || p.Tags[0] != "a" || p.Tags[1] != "b" {
		t.Fatalf("tags not mapped: %v", p.Tags)
	}
	if !p.Address.Valid || p.Address.String != "addr" {
		t.Fatalf("address not mapped: %+v", p.Address)
	}
	if !p.AttachedPostID.Valid || p.AttachedPostID.String != "att-1" {
		t.Fatalf("attached id not mapped: %+v", p.AttachedPostID)
	}
	if p.ID == "" {
		t.Fatal("expected generated ID")
	}
	if p.Location.Valid {
		t.Fatal("location should be invalid when lat/lon are zero")
	}
}

func TestPostFromAddReqEmptyOptionals(t *testing.T) {
	p := postFromAddReq(&AddRequest{Title: "t", Description: "d"})
	if p.Address.Valid {
		t.Fatal("empty address should be null")
	}
	if p.AttachedPostID.Valid {
		t.Fatal("empty attached id should be null")
	}
}

func TestPostFromAddReqLocation(t *testing.T) {
	p := postFromAddReq(&AddRequest{Title: "t", Description: "d", Latitude: 9.03, Longitude: 38.74})
	if !p.Location.Valid {
		t.Fatal("location should be valid when coords set")
	}
	if x := p.Location.Point.X(); x != 38.74 {
		t.Fatalf("X (longitude) = %v, want 38.74", x)
	}
	if y := p.Location.Point.Y(); y != 9.03 {
		t.Fatalf("Y (latitude) = %v, want 9.03", y)
	}
}
