package auth

import (
	"testing"

	"github.com/beka-birhanu/yetbota/identity-service/drivers/constants"
)

func TestNormalizePhone(t *testing.T) {
	got, err := normalizePhone("+251911223344")
	if err != nil {
		t.Fatalf("normalizePhone error: %v", err)
	}
	if got == "" {
		t.Fatal("expected non-empty normalized phone")
	}
	_, err = normalizePhone("invalid")
	if err == nil {
		t.Fatal("expected error for invalid phone")
	}
	_ = constants.DefaultPhoneRegion
}
