package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/middleware"
)

func main() {
	cfg := config.Load()

	// Attempt connecting to MySQL database
	db, err := database.Connect(cfg.DSN())
	if err != nil {
		log.Printf("⚠️ Warning: Could not connect to database (%v). Server will start with fallback mode.", err)
	} else if db != nil {
		defer db.Close()

		// Initialize Schema and Seed Adventure 1
		if err := db.InitSchema(); err != nil {
			log.Printf("⚠️ Error initializing database schema: %v", err)
		} else {
			if err := db.SeedAdventure1(); err != nil {
				log.Printf("⚠️ Error seeding Adventure 1: %v", err)
			}
		}
	}

	h := handlers.NewHandler(db)

	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("GET /api/v1/health", h.HealthCheckHandler)
	mux.HandleFunc("GET /api/v1/adventures", h.GetAdventuresHandler)
	mux.HandleFunc("GET /api/v1/levels", h.GetLevelsHandler)
	mux.HandleFunc("POST /api/v1/levels/{id}/waypoints", h.SaveWaypointsHandler)
	mux.HandleFunc("POST /api/v1/levels/waypoints", h.SaveWaypointsHandler)

	// Embeddable Engine routes
	mux.HandleFunc("POST /api/v1/engine/handshake", h.HandshakeHandler)
	mux.HandleFunc("POST /api/v1/engine/events", h.EventHandler)
	mux.HandleFunc("GET /api/v1/leaderboard", h.GetLeaderboardHandler)
	mux.HandleFunc("GET /api/v1/groups", h.GetGroupsHandler)

	// Apply middleware
	corsMiddleware := middleware.CORS(cfg.AllowedCORS)
	handler := corsMiddleware(mux)

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Server run context
	serverCtx, serverStopCtx := context.WithCancel(context.Background())

	// Listen for OS signals for graceful shutdown
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sig

		// Shutdown signal received
		shutdownCtx, cancel := context.WithTimeout(serverCtx, 30*time.Second)
		defer cancel()

		go func() {
			<-shutdownCtx.Done()
			if shutdownCtx.Err() == context.DeadlineExceeded {
				log.Fatal("graceful shutdown timed out.. forcing exit.")
			}
		}()

		// Trigger graceful shutdown
		err := server.Shutdown(shutdownCtx)
		if err != nil {
			log.Fatalf("server shutdown error: %v", err)
		}
		serverStopCtx()
	}()

	fmt.Printf("🚀 Go Backend Server running in %s mode on http://localhost:%s\n", cfg.Environment, cfg.Port)
	err = server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}

	<-serverCtx.Done()
	fmt.Println("Server gracefully stopped.")
}
