package main

import (
	"fmt"
	"log"
	"net/http"

	"game_engine/internal/config"
	"game_engine/internal/database"
	"game_engine/internal/handlers"
	"game_engine/internal/middleware"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DSN())
	if err != nil {
		log.Printf("⚠️ Warning: Could not connect to database (%v)", err)
	} else if db != nil {
		defer db.Close()
		if err := db.InitGameEngineSchema(); err != nil {
			log.Printf("⚠️ Error initializing game_engine schema: %v", err)
		} else {
			_ = db.SeedWorldsAndAdventures()
		}
	}

	h := handlers.New(db)
	mux := http.NewServeMux()

	// Microservice 1: game_engine API routes
	mux.HandleFunc("GET /api/v1/game/worlds", h.GetWorldsHandler)
	mux.HandleFunc("GET /api/v1/game/adventures", h.GetAdventuresHandler)
	mux.HandleFunc("GET /api/v1/game/levels", h.GetLevelsHandler)
	mux.HandleFunc("POST /api/v1/game/admin/levels/waypoints", h.SaveWaypointsHandler)

	// Legacy aliases
	mux.HandleFunc("GET /api/v1/adventures", h.GetAdventuresHandler)
	mux.HandleFunc("GET /api/v1/levels", h.GetLevelsHandler)
	mux.HandleFunc("POST /api/v1/levels/{id}/waypoints", h.SaveWaypointsHandler)
	mux.HandleFunc("POST /api/v1/levels/waypoints", h.SaveWaypointsHandler)

	corsMiddleware := middleware.CORS(cfg.AllowedCORS)
	handler := corsMiddleware(mux)

	fmt.Printf("🎮 [game_engine microservice] running on http://localhost:%s\n", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, handler); err != nil {
		log.Fatalf("game_engine exit error: %v", err)
	}
}
