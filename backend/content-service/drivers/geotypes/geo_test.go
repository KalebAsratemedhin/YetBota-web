package geotypes

import (
	"testing"

	"github.com/twpayne/go-geom"
)

func TestNullPointRoundTrip(t *testing.T) {
	pt := geom.NewPoint(geom.XY).MustSetCoords([]float64{38.74, 9.03})
	np := NullPoint{Point: pt, Valid: true}

	v, err := np.Value()
	if err != nil {
		t.Fatalf("Value error: %v", err)
	}
	hexStr, ok := v.(string)
	if !ok {
		t.Fatalf("Value returned %T, want hex string", v)
	}

	var got NullPoint
	if err := got.Scan([]byte(hexStr)); err != nil {
		t.Fatalf("Scan error: %v", err)
	}
	if !got.Valid {
		t.Fatal("scanned point should be valid")
	}
	if got.Point.X() != 38.74 || got.Point.Y() != 9.03 {
		t.Fatalf("coords = (%v, %v), want (38.74, 9.03)", got.Point.X(), got.Point.Y())
	}
}

func TestNullPointScanNil(t *testing.T) {
	var np NullPoint
	if err := np.Scan(nil); err != nil {
		t.Fatalf("Scan(nil) error: %v", err)
	}
	if np.Valid || np.Point != nil {
		t.Fatalf("nil scan should yield invalid empty point: %+v", np)
	}
}

func TestNullPointValueInvalid(t *testing.T) {
	np := NullPoint{Valid: false}
	v, err := np.Value()
	if err != nil {
		t.Fatalf("Value error: %v", err)
	}
	if v != nil {
		t.Fatalf("invalid NullPoint should value to nil, got %v", v)
	}
}

func TestIsHexBytes(t *testing.T) {
	cases := []struct {
		in   string
		want bool
	}{
		{"abcd", true},
		{"00FF1a", true},
		{"", false},
		{"abc", false},   // odd length
		{"xyz1", false},  // non-hex char
		{"12 4", false},  // space
	}
	for _, c := range cases {
		if got := isHexBytes([]byte(c.in)); got != c.want {
			t.Fatalf("isHexBytes(%q) = %v, want %v", c.in, got, c.want)
		}
	}
}
