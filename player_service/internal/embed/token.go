package embed

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

var EmbedSecretKey = []byte("PUZZLEPRO_EMBED_TOKEN_HMAC_SECRET_2026")

// EmbedTokenPayload contains ONLY minimal info (org_id and expiration)
type EmbedTokenPayload struct {
	OrgID      string `json:"org_id"`
	Expiration int64  `json:"exp"`
}

// GenerateSignedEmbedToken creates a signed embed token for an organisation
func GenerateSignedEmbedToken(orgID string, duration time.Duration) (string, error) {
	if duration <= 0 {
		duration = 365 * 24 * time.Hour // Default 1 year validity
	}
	exp := time.Now().Add(duration).Unix()

	payload := EmbedTokenPayload{
		OrgID:      orgID,
		Expiration: exp,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	payloadB64 := base64.RawURLEncoding.EncodeToString(payloadBytes)

	h := hmac.New(sha256.New, EmbedSecretKey)
	h.Write([]byte(payloadB64))
	sig := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	return fmt.Sprintf("EMB.%s.%s", payloadB64, sig), nil
}

// VerifySignedEmbedToken parses and validates token signature & expiration
func VerifySignedEmbedToken(tokenStr string) (*EmbedTokenPayload, error) {
	tokenStr = strings.TrimSpace(tokenStr)
	parts := strings.Split(tokenStr, ".")
	if len(parts) != 3 || parts[0] != "EMB" {
		return nil, errors.New("invalid token format: must be a signed EMB token")
	}

	payloadB64 := parts[1]
	sig := parts[2]

	// Verify HMAC Signature
	h := hmac.New(sha256.New, EmbedSecretKey)
	h.Write([]byte(payloadB64))
	expectedSig := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	if !hmac.Equal([]byte(sig), []byte(expectedSig)) {
		return nil, errors.New("invalid embed token signature")
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(payloadB64)
	if err != nil {
		return nil, errors.New("invalid token payload encoding")
	}

	var payload EmbedTokenPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, errors.New("invalid token payload structure")
	}

	// Verify expiration
	if payload.Expiration > 0 && time.Now().Unix() > payload.Expiration {
		return nil, errors.New("embed token has expired")
	}

	return &payload, nil
}
