package utils

import (
	"errors"
	"strings"
	"testing"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/identity-service/drivers/dbmodels"
	"github.com/beka-birhanu/yetbota/identity-service/internal/domain/auth"
	ctxRP "github.com/beka-birhanu/yetbota/identity-service/internal/domain/context"
)

// hash

func TestHasherHashAndVerify(t *testing.T) {
	h := NewHasher()

	hashed, err := h.Hash("s3cret")
	if err != nil {
		t.Fatalf("Hash returned error: %v", err)
	}
	if hashed == "" || hashed == "s3cret" {
		t.Fatalf("unexpected hash %q", hashed)
	}
	if err := h.Verify(hashed, "s3cret"); err != nil {
		t.Fatalf("Verify failed for correct password: %v", err)
	}
	if err := h.Verify(hashed, "wrong"); err == nil {
		t.Fatal("Verify succeeded for wrong password")
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

// shared (access control)

func ctxWithRole(role string) *ctxRP.Context {
	return &ctxRP.Context{UserSession: auth.UserSession{Role: role, UserID: "user-1"}}
}

func TestAllowAccess(t *testing.T) {
	if err := AllowAccess(ctxWithRole(dbmodels.RolesUSER)); err != nil {
		t.Fatalf("AllowAccess should never error, got %v", err)
	}
	if err := AllowAccess(ctxWithRole("UNKNOWN")); err != nil {
		t.Fatalf("AllowAccess should never error, got %v", err)
	}
}

func TestAllowAdminAccess(t *testing.T) {
	if err := AllowAdminAccess(ctxWithRole(dbmodels.RolesADMIN)); err != nil {
		t.Fatalf("admin should be allowed: %v", err)
	}

	err := AllowAdminAccess(ctxWithRole(dbmodels.RolesUSER))
	if err == nil {
		t.Fatal("user should be forbidden")
	}
	var te *toddlerr.Error
	if !errors.As(err, &te) || te.PublicStatusCode != status.Forbidden {
		t.Fatalf("expected Forbidden error, got %v", err)
	}
}
