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
	mux.HandleFunc("POST /api/v1/player/handshake", h.HandshakeHandler)
	mux.HandleFunc("POST /api/v1/player/code-login", h.CodeLoginHandler)
	mux.HandleFunc("GET /api/v1/player/verify-session", h.VerifySessionHandler)
	mux.HandleFunc("POST /api/v1/player/events", h.EventHandler)
	mux.HandleFunc("GET /api/v1/player/progress", h.GetProgressHandler)
	mux.HandleFunc("GET /api/v1/player/leaderboard", h.GetLeaderboardHandler)
	mux.HandleFunc("GET /api/v1/player/groups", h.GetGroupsHandler)

	// Legacy aliases
	mux.HandleFunc("POST /api/v1/engine/handshake", h.HandshakeHandler)
	mux.HandleFunc("POST /api/v1/engine/code-login", h.CodeLoginHandler)
	mux.HandleFunc("GET /api/v1/engine/verify-session", h.VerifySessionHandler)
	mux.HandleFunc("POST /api/v1/engine/events", h.EventHandler)
	mux.HandleFunc("GET /api/v1/engine/progress", h.GetProgressHandler)
	mux.HandleFunc("GET /api/v1/leaderboard", h.GetLeaderboardHandler)
	mux.HandleFunc("GET /api/v1/groups", h.GetGroupsHandler)

	corsMiddleware := middleware.CORS(cfg.AllowedCORS)
	handler := corsMiddleware(mux)

	fmt.Printf("👤 [player_service microservice] running on http://localhost:%s\n", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, handler); err != nil {
		log.Fatalf("player_service exit error: %v", err)
	}
}
