package userdevice

import (
	"testing"

	"github.com/beka-birhanu/yetbota/identity-service/internal/domain/auth"
	ctxYB "github.com/beka-birhanu/yetbota/identity-service/internal/domain/context"
)

func ctxWithUser(userID string) *ctxYB.Context {
	return &ctxYB.Context{UserSession: auth.UserSession{UserID: userID}}
}

func TestNewFromRegisterRequest(t *testing.T) {
	req := &RegisterDeviceRequest{
		DeviceID:  "dev-1",
		Token:     "tok-1",
		Latitude:  12.3,
		Longitude: 0,
	}
	d := newFromRegisterRequest(req, ctxWithUser("user-9"))

	if d.UserID != "user-9" {
		t.Fatalf("UserID = %q, want user-9", d.UserID)
	}
	if d.DeviceID != "dev-1" {
		t.Fatalf("DeviceID = %q, want dev-1", d.DeviceID)
	}
	if !d.Token.Valid || d.Token.String != "tok-1" {
		t.Fatalf("Token not set: %+v", d.Token)
	}
	if !d.Lat.Valid || d.Lat.Float64 != 12.3 {
		t.Fatalf("Lat not set: %+v", d.Lat)
	}
	if d.Long.Valid {
		t.Fatal("Long should be invalid when Longitude is zero")
	}
}

func TestNewFromRegisterRequestEmptyOptionals(t *testing.T) {
	d := newFromRegisterRequest(&RegisterDeviceRequest{DeviceID: "dev-2"}, ctxWithUser("u"))
	if d.Token.Valid || d.Oem.Valid || d.Device.Valid || d.Os.Valid {
		t.Fatalf("empty optionals should be null: %+v", d)
	}
	if d.Lat.Valid || d.Long.Valid {
		t.Fatal("zero coords should be null")
	}
}
