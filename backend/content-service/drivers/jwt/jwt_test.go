package jwt

import (
	"context"
	"errors"
	"os"
	"testing"
	"time"

	toddlerErr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/content-service/drivers/validator"
	"github.com/beka-birhanu/yetbota/content-service/internal/domain/auth"
	"github.com/redis/go-redis/v9"
)

func TestMain(m *testing.M) {
	validator.InitValidator()
	os.Exit(m.Run())
}

func testClient() *redis.Client {
	return redis.NewClient(&redis.Options{Addr: "localhost:6379"})
}

func validConfig() *Config {
	return &Config{
		AccessKey:  "access-key",
		RefreshKey: "refresh-key",
		AccessTTL:  time.Minute,
		RefreshTTL: time.Hour,
		Algo:       "HS256",
		RedisConn:  testClient(),
	}
}

func TestConfigValidate(t *testing.T) {
	if err := (&Config{}).Validate(); err == nil {
		t.Fatal("empty config should fail validation")
	}
	if err := validConfig().Validate(); err != nil {
		t.Fatalf("valid config failed: %v", err)
	}
}

func TestNewSessionManagerGuestKeyDefault(t *testing.T) {
	sm, err := NewSessionManager(validConfig())
	if err != nil {
		t.Fatalf("NewSessionManager: %v", err)
	}
	if sm.guestKey != "access-key_guest" {
		t.Fatalf("guestKey = %q, want access-key_guest", sm.guestKey)
	}

	cfg := validConfig()
	cfg.GuestKey = "custom-guest"
	sm2, err := NewSessionManager(cfg)
	if err != nil {
		t.Fatalf("NewSessionManager: %v", err)
	}
	if sm2.guestKey != "custom-guest" {
		t.Fatalf("guestKey = %q, want custom-guest", sm2.guestKey)
	}
}

func TestSessionTokenRoundTrip(t *testing.T) {
	sm, err := NewSessionManager(validConfig())
	if err != nil {
		t.Fatalf("NewSessionManager: %v", err)
	}

	info := &auth.SessionInfo{
		Username:   "bob",
		UserID:     "550e8400-e29b-41d4-a716-446655440000",
		Role:       "USER",
		AccessTTL:  time.Minute,
		RefreshTTL: time.Hour,
	}
	td, err := sm.NewSessionDetails(context.Background(), info)
	if err != nil {
		t.Fatalf("NewSessionDetails: %v", err)
	}
	if td.AccessToken == "" || td.RefreshToken == "" {
		t.Fatal("expected non-empty tokens")
	}

	tok, err := sm.parseToken("Bearer "+td.AccessToken, sm.accessKey)
	if err != nil {
		t.Fatalf("parseToken: %v", err)
	}
	claims, err := validateToken(tok)
	if err != nil {
		t.Fatalf("validateToken: %v", err)
	}
	if claims["username"] != "bob" {
		t.Fatalf("username claim = %v", claims["username"])
	}
	if claims["user_id"] != info.UserID {
		t.Fatalf("user_id claim = %v", claims["user_id"])
	}
	if claims["role"] != "USER" {
		t.Fatalf("role claim = %v", claims["role"])
	}
	if claims["session_id"] != td.AccessUuid {
		t.Fatalf("session_id claim = %v, want %v", claims["session_id"], td.AccessUuid)
	}
}

func TestParseTokenErrors(t *testing.T) {
	sm, err := NewSessionManager(validConfig())
	if err != nil {
		t.Fatalf("NewSessionManager: %v", err)
	}

	_, err = sm.parseToken("no-bearer-prefix", sm.accessKey)
	if err == nil {
		t.Fatal("expected error for missing Bearer prefix")
	}
	var te *toddlerErr.Error
	if !errors.As(err, &te) || te.ServiceStatusCode != status.BadRequestInvalidFormat {
		t.Fatalf("expected BadRequestInvalidFormat, got %v", err)
	}

	td, err := sm.NewSessionDetails(context.Background(), &auth.SessionInfo{
		Username: "bob", UserID: "u1", Role: "USER", AccessTTL: time.Minute, RefreshTTL: time.Hour,
	})
	if err != nil {
		t.Fatalf("NewSessionDetails: %v", err)
	}
	if _, err := sm.parseToken("Bearer "+td.AccessToken+"tampered", sm.accessKey); err == nil {
		t.Fatal("expected error for tampered token")
	}
}
