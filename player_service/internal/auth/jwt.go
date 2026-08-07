package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

var jwtSecret = []byte("puzzlepro_secret_jwt_key_2026_lae")

type JWTClaims struct {
	UserID     int    `json:"sub"`
	Username   string `json:"user"`
	Role       string `json:"role"`
	AccessCode string `json:"code"`
	ExpiresAt  int64  `json:"exp"`
}

func base64UrlEncode(data []byte) string {
	return strings.TrimRight(base64.URLEncoding.EncodeToString(data), "=")
}

func base64UrlDecode(s string) ([]byte, error) {
	if l := len(s) % 4; l > 0 {
		s += strings.Repeat("=", 4-l)
	}
	return base64.URLEncoding.DecodeString(s)
}

func GenerateToken(userID int, username, role, accessCode string) (string, error) {
	headerJSON := []byte(`{"alg":"HS256","typ":"JWT"}`)
	headerEnc := base64UrlEncode(headerJSON)

	claims := JWTClaims{
		UserID:     userID,
		Username:   username,
		Role:       role,
		AccessCode: accessCode,
		ExpiresAt:  time.Now().Add(30 * 24 * time.Hour).Unix(),
	}

	payloadJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	payloadEnc := base64UrlEncode(payloadJSON)

	unsignedToken := fmt.Sprintf("%s.%s", headerEnc, payloadEnc)

	h := hmac.New(sha256.New, jwtSecret)
	h.Write([]byte(unsignedToken))
	sigEnc := base64UrlEncode(h.Sum(nil))

	return fmt.Sprintf("%s.%s", unsignedToken, sigEnc), nil
}

func VerifyToken(tokenString string) (*JWTClaims, error) {
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid token format")
	}

	unsignedToken := fmt.Sprintf("%s.%s", parts[0], parts[1])
	h := hmac.New(sha256.New, jwtSecret)
	h.Write([]byte(unsignedToken))
	expectedSig := base64UrlEncode(h.Sum(nil))

	if !hmac.Equal([]byte(parts[2]), []byte(expectedSig)) {
		return nil, fmt.Errorf("invalid token signature")
	}

	payloadBytes, err := base64UrlDecode(parts[1])
	if err != nil {
		return nil, fmt.Errorf("failed to decode payload: %w", err)
	}

	var claims JWTClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, fmt.Errorf("failed to parse claims: %w", err)
	}

	if time.Now().Unix() > claims.ExpiresAt {
		return nil, fmt.Errorf("token expired")
	}

	return &claims, nil
}
