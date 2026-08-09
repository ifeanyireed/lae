package main

import (
	"fmt"
	"log"
	"net/http"

	"player_service/internal/config"
	"player_service/internal/database"
	"player_service/internal/handlers"
	"player_service/internal/middleware"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DSN())
	if err != nil {
		log.Printf("⚠️ Warning: Could not connect to database (%v)", err)
	} else if db != nil {
		defer db.Close()
		if err := db.InitPlayerServiceSchema(); err != nil {
			log.Printf("⚠️ Error initializing player_service schema: %v", err)
		}
	}

	h := handlers.New(db)
	mux := http.NewServeMux()

	// Microservice 2: player_service API routes
	mux.HandleFunc("/api/v1/player/handshake", h.HandshakeHandler)
	mux.HandleFunc("/api/v1/player/code-login", h.CodeLoginHandler)
	mux.HandleFunc("/api/v1/player/verify-session", h.VerifySessionHandler)
	mux.HandleFunc("/api/v1/player/events", h.EventHandler)
	mux.HandleFunc("/api/v1/player/progress", h.GetProgressHandler)
	mux.HandleFunc("/api/v1/player/leaderboard", h.GetLeaderboardHandler)
	mux.HandleFunc("/api/v1/player/groups", h.GetGroupsHandler)
	mux.HandleFunc("/api/v1/player/centres", h.GetCentresHandler)

	// iFrame Embed Verification & Token Endpoints
	mux.HandleFunc("/api/v1/embed/verify", h.VerifyEmbedTokenHandler)
	mux.HandleFunc("/api/v1/embed/handshake", h.VerifyEmbedTokenHandler)
	mux.HandleFunc("/api/v1/embed/generate-token", h.GenerateEmbedTokenHandler)

	// Centres REST Endpoints
	mux.HandleFunc("/api/v1/centres", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetCentresHandler(w, r)
		case http.MethodPost, http.MethodPut:
			h.SaveCentreHandler(w, r)
		case http.MethodDelete:
			h.DeleteCentreHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Groups REST Endpoints
	mux.HandleFunc("/api/v1/groups", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetGroupsHandler(w, r)
		case http.MethodPost, http.MethodPut:
			h.SaveGroupHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Admin Controls & Portal REST Endpoints
	mux.HandleFunc("/api/v1/organisations", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetOrganisationsHandler(w, r)
		case http.MethodPost, http.MethodPut:
			h.SaveOrganisationHandler(w, r)
		case http.MethodDelete:
			h.DeleteOrganisationHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/v1/organisations/google-ads", h.ToggleGoogleAdsHandler)

	mux.HandleFunc("/api/v1/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetUsersAdminHandler(w, r)
		case http.MethodPost, http.MethodPut:
			h.SaveUserAdminHandler(w, r)
		case http.MethodDelete:
			h.DeleteUserAdminHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/v1/users/world", h.AssignWorldHandler)
	mux.HandleFunc("/api/v1/users/batch", h.BatchSaveUsersHandler)

	mux.HandleFunc("/api/v1/subscriptions", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.GetSubscriptionsHandler(w, r)
		case http.MethodPost, http.MethodPut:
			h.SaveSubscriptionHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Legacy aliases
	mux.HandleFunc("/api/v1/engine/handshake", h.HandshakeHandler)
	mux.HandleFunc("/api/v1/engine/code-login", h.CodeLoginHandler)
	mux.HandleFunc("/api/v1/engine/verify-session", h.VerifySessionHandler)
	mux.HandleFunc("/api/v1/engine/events", h.EventHandler)
	mux.HandleFunc("/api/v1/engine/progress", h.GetProgressHandler)
	mux.HandleFunc("/api/v1/leaderboard", h.GetLeaderboardHandler)
	mux.HandleFunc("/api/v1/groups", h.GetGroupsHandler)

	corsMiddleware := middleware.CORS(cfg.AllowedCORS)
	handler := corsMiddleware(mux)

	fmt.Printf("👤 [player_service microservice] running on http://localhost:%s\n", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, handler); err != nil {
		log.Fatalf("player_service exit error: %v", err)
	}
}
