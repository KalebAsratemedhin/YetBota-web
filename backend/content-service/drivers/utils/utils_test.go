package utils

import (
	"bytes"
	"errors"
	"image"
	"image/color"
	"image/gif"
	"image/jpeg"
	"image/png"
	"strings"
	"testing"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/content-service/drivers/constants"
	"github.com/beka-birhanu/yetbota/content-service/internal/domain/auth"
	ctxRP "github.com/beka-birhanu/yetbota/content-service/internal/domain/context"
)

// hash

func TestHasherHashAndVerify(t *testing.T) {
	h := NewHasher()

	hashed, err := h.Hash("s3cret")
	if err != nil {
		t.Fatalf("Hash returned error: %v", err)
	}
	if hashed == "" {
		t.Fatal("Hash returned empty string")
	}
	if hashed == "s3cret" {
		t.Fatal("Hash returned plaintext")
	}

	if err := h.Verify(hashed, "s3cret"); err != nil {
		t.Fatalf("Verify failed for correct password: %v", err)
	}
	if err := h.Verify(hashed, "wrong"); err == nil {
		t.Fatal("Verify succeeded for wrong password")
	}
}

func TestHasherHashIsSalted(t *testing.T) {
	h := NewHasher()

	a, err := h.Hash("same")
	if err != nil {
		t.Fatalf("Hash error: %v", err)
	}
	b, err := h.Hash("same")
	if err != nil {
		t.Fatalf("Hash error: %v", err)
	}
	if a == b {
		t.Fatal("expected distinct hashes for the same input (bcrypt salt)")
	}
}

// random

const crockford = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

func TestGenerateThreadID(t *testing.T) {
	id := GenerateThreadID()
	if len(id) != 26 {
		t.Fatalf("expected ULID length 26, got %d (%q)", len(id), id)
	}
	for _, c := range id {
		if !strings.ContainsRune(crockford, c) {
			t.Fatalf("unexpected character %q in ULID %q", c, id)
		}
	}
}

func TestGenerateThreadIDUnique(t *testing.T) {
	seen := make(map[string]struct{}, 1000)
	for i := 0; i < 1000; i++ {
		id := GenerateThreadID()
		if _, dup := seen[id]; dup {
			t.Fatalf("duplicate ULID generated: %s", id)
		}
		seen[id] = struct{}{}
	}
}

// image

func solidImage(w, h int) image.Image {
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for x := 0; x < w; x++ {
		for y := 0; y < h; y++ {
			img.Set(x, y, color.RGBA{R: 100, G: 150, B: 200, A: 255})
		}
	}
	return img
}

func pngBytes(t *testing.T, w, h int) []byte {
	t.Helper()
	var buf bytes.Buffer
	if err := png.Encode(&buf, solidImage(w, h)); err != nil {
		t.Fatalf("png encode: %v", err)
	}
	return buf.Bytes()
}

func jpegBytes(t *testing.T, w, h int) []byte {
	t.Helper()
	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, solidImage(w, h), nil); err != nil {
		t.Fatalf("jpeg encode: %v", err)
	}
	return buf.Bytes()
}

func gifBytes(t *testing.T, w, h int) []byte {
	t.Helper()
	var buf bytes.Buffer
	if err := gif.Encode(&buf, solidImage(w, h), nil); err != nil {
		t.Fatalf("gif encode: %v", err)
	}
	return buf.Bytes()
}

func TestImageMimeType(t *testing.T) {
	if mime, err := ImageMimeType(pngBytes(t, 10, 10)); err != nil || mime != "image/png" {
		t.Fatalf("png: got (%q, %v), want image/png", mime, err)
	}
	if mime, err := ImageMimeType(jpegBytes(t, 10, 10)); err != nil || mime != "image/jpeg" {
		t.Fatalf("jpeg: got (%q, %v), want image/jpeg", mime, err)
	}
	if _, err := ImageMimeType(gifBytes(t, 10, 10)); err == nil {
		t.Fatal("gif: expected unsupported-format error")
	}
	if _, err := ImageMimeType([]byte("not an image")); err == nil {
		t.Fatal("garbage: expected decode error")
	}
}

func TestProcessImageDownscalesLarge(t *testing.T) {
	out, mime, err := ProcessImage(pngBytes(t, 4000, 100))
	if err != nil {
		t.Fatalf("ProcessImage error: %v", err)
	}
	if mime != "image/png" {
		t.Fatalf("mime = %q, want image/png", mime)
	}
	cfg, _, err := image.DecodeConfig(bytes.NewReader(out))
	if err != nil {
		t.Fatalf("decode result: %v", err)
	}
	if cfg.Width > 3840 || cfg.Height > 3840 {
		t.Fatalf("result %dx%d exceeds 3840 cap", cfg.Width, cfg.Height)
	}
}

func TestProcessImageKeepsSmall(t *testing.T) {
	out, mime, err := ProcessImage(jpegBytes(t, 200, 150))
	if err != nil {
		t.Fatalf("ProcessImage error: %v", err)
	}
	if mime != "image/jpeg" {
		t.Fatalf("mime = %q, want image/jpeg", mime)
	}
	cfg, _, err := image.DecodeConfig(bytes.NewReader(out))
	if err != nil {
		t.Fatalf("decode result: %v", err)
	}
	if cfg.Width != 200 || cfg.Height != 150 {
		t.Fatalf("result %dx%d, want 200x150", cfg.Width, cfg.Height)
	}
}

func TestCompressToMaxDim(t *testing.T) {
	out, _, err := CompressToMaxDim(pngBytes(t, 300, 300), 100)
	if err != nil {
		t.Fatalf("CompressToMaxDim error: %v", err)
	}
	cfg, _, err := image.DecodeConfig(bytes.NewReader(out))
	if err != nil {
		t.Fatalf("decode result: %v", err)
	}
	if cfg.Width > 100 || cfg.Height > 100 {
		t.Fatalf("result %dx%d exceeds maxDim 100", cfg.Width, cfg.Height)
	}
}

// shared (access control)

func ctxWithRole(role string) *ctxRP.Context {
	return &ctxRP.Context{UserSession: auth.UserSession{Role: role, UserID: "user-1"}}
}

func TestIsAdmin(t *testing.T) {
	if !IsAdmin(ctxWithRole(constants.RoleAdmin)) {
		t.Fatal("admin role should be admin")
	}
	if IsAdmin(ctxWithRole(constants.RoleUser)) {
		t.Fatal("user role should not be admin")
	}
}

func TestEnsureVisible(t *testing.T) {
	if err := EnsureVisible(ctxWithRole(constants.RoleUser), constants.ModerationStatusVisible, "post", "p1"); err != nil {
		t.Fatalf("visible post should be allowed: %v", err)
	}
	if err := EnsureVisible(ctxWithRole(constants.RoleAdmin), constants.ModerationStatusHidden, "post", "p1"); err != nil {
		t.Fatalf("admin should see hidden post: %v", err)
	}

	err := EnsureVisible(ctxWithRole(constants.RoleUser), constants.ModerationStatusHidden, "post", "p1")
	if err == nil {
		t.Fatal("non-admin should not see hidden post")
	}
	var te *toddlerr.Error
	if !errors.As(err, &te) || te.PublicStatusCode != status.NotFound {
		t.Fatalf("expected NotFound error, got %v", err)
	}
}

func TestAllowAdminOrCSAAccess(t *testing.T) {
	if err := AllowAdminOrCSAAccess(ctxWithRole(constants.RoleAdmin)); err != nil {
		t.Fatalf("admin should be allowed: %v", err)
	}

	err := AllowAdminOrCSAAccess(ctxWithRole(constants.RoleUser))
	if err == nil {
		t.Fatal("user should be forbidden")
	}
	var te *toddlerr.Error
	if !errors.As(err, &te) || te.PublicStatusCode != status.Forbidden {
		t.Fatalf("expected Forbidden error, got %v", err)
	}
}

func TestAllowAccess(t *testing.T) {
	if err := AllowAccess(ctxWithRole(constants.RoleUser)); err != nil {
		t.Fatalf("AllowAccess should never error, got %v", err)
	}
	if err := AllowAccess(ctxWithRole("UNKNOWN")); err != nil {
		t.Fatalf("AllowAccess should never error, got %v", err)
	}
}
