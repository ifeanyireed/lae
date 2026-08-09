package mailer_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"player_service/internal/mailer"
)

func TestSendEmail(t *testing.T) {
	expectedTo := "test@example.com"
	expectedSubject := "Test Subject"
	expectedHTML := "<p>Test HTML</p>"
	expectedText := "Test Text"
	apiKey := "test_api_key_12345"
	fromEmail := "info@netslogistics.com"
	fromName := "Nets Logistics"

	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify HTTP Method
		if r.Method != http.MethodPost {
			t.Errorf("Expected POST method, got %s", r.Method)
		}

		// Verify Headers
		if authHeader := r.Header.Get("Authorization"); authHeader != "Bearer "+apiKey {
			t.Errorf("Expected Authorization header 'Bearer %s', got '%s'", apiKey, authHeader)
		}
		if apiKeyHeader := r.Header.Get("X-API-Key"); apiKeyHeader != apiKey {
			t.Errorf("Expected X-API-Key header '%s', got '%s'", apiKey, apiKeyHeader)
		}
		if contentType := r.Header.Get("Content-Type"); contentType != "application/json" {
			t.Errorf("Expected Content-Type 'application/json', got '%s'", contentType)
		}

		// Verify Payload Body
		var payload mailer.SendEmailPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("Failed to decode request body: %v", err)
		}

		if payload.To != expectedTo {
			t.Errorf("Expected 'to' %s, got %s", expectedTo, payload.To)
		}
		if payload.Subject != expectedSubject {
			t.Errorf("Expected 'subject' %s, got %s", expectedSubject, payload.Subject)
		}
		if payload.HTML != expectedHTML {
			t.Errorf("Expected 'html' %s, got %s", expectedHTML, payload.HTML)
		}
		if payload.Text != expectedText {
			t.Errorf("Expected 'text' %s, got %s", expectedText, payload.Text)
		}
		if payload.From != fromEmail {
			t.Errorf("Expected 'from' %s, got %s", fromEmail, payload.From)
		}
		if payload.FromName != fromName {
			t.Errorf("Expected 'from_name' %s, got %s", fromName, payload.FromName)
		}

		// Respond with success
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Email sent successfully",
		})
	}))
	defer mockServer.Close()

	m := mailer.New(mockServer.URL, apiKey, fromEmail, fromName)
	err := m.SendEmail(expectedTo, expectedSubject, expectedHTML, expectedText)
	if err != nil {
		t.Fatalf("SendEmail returned unexpected error: %v", err)
	}
}

func TestSendEmailErrorResponse(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid or missing \"to\" email address",
		})
	}))
	defer mockServer.Close()

	m := mailer.New(mockServer.URL, "key", "from@example.com", "Sender")
	err := m.SendEmail("", "Subject", "<p>Body</p>", "Body")
	if err == nil {
		t.Fatal("Expected error for empty 'to' address, got nil")
	}
}
