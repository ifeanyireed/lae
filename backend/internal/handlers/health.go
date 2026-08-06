package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"backend/internal/database"
)

type Handler struct {
	DB *database.DB
}

func NewHandler(db *database.DB) *Handler {
	return &Handler{DB: db}
}

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Service   string    `json:"service"`
	Database  string    `json:"database"`
}

func (h *Handler) HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	dbStatus := "connected"
	if h.DB != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()
		if err := h.DB.PingContext(ctx); err != nil {
			dbStatus = "disconnected (" + err.Error() + ")"
		}
	} else {
		dbStatus = "not initialized"
	}

	resp := HealthResponse{
		Status:    "ok",
		Timestamp: time.Now(),
		Service:   "learn-backend-api",
		Database:  dbStatus,
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}
