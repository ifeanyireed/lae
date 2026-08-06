package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/internal/database"
)

type Level struct {
	ID          int                      `json:"id"`
	LevelNumber int                      `json:"level_number"`
	Title       string                   `json:"title"`
	Objective   string                   `json:"objective"`
	Mechanic    string                   `json:"mechanic"`
	Difficulty  string                   `json:"difficulty,omitempty"`
	Waypoints   []database.LevelWaypoint `json:"waypoints,omitempty"`
}

type UpdateWaypointsRequest struct {
	LevelNumber int                      `json:"level_number"`
	Waypoints   []database.LevelWaypoint `json:"waypoints"`
}

func (h *Handler) GetLevelsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if h.DB != nil {
		rows, err := h.DB.QueryContext(r.Context(), "SELECT id, level_number, title, objective, mechanic, waypoints FROM levels ORDER BY level_number ASC")
		if err == nil {
			defer rows.Close()
			var levels []Level
			for rows.Next() {
				var lvl Level
				var waypointsRaw []byte
				if err := rows.Scan(&lvl.ID, &lvl.LevelNumber, &lvl.Title, &lvl.Objective, &lvl.Mechanic, &waypointsRaw); err == nil {
					if len(waypointsRaw) > 0 {
						_ = json.Unmarshal(waypointsRaw, &lvl.Waypoints)
					}
					levels = append(levels, lvl)
				}
			}
			if len(levels) > 0 {
				w.WriteHeader(http.StatusOK)
				_ = json.NewEncoder(w).Encode(map[string]interface{}{
					"success": true,
					"source":  "database",
					"levels":  levels,
				})
				return
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"source":  "static",
		"levels":  []Level{},
	})
}

func (h *Handler) SaveWaypointsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req UpdateWaypointsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	if req.LevelNumber <= 0 {
		levelStr := r.PathValue("id")
		if levelStr != "" {
			if lvlNum, err := strconv.Atoi(levelStr); err == nil {
				req.LevelNumber = lvlNum
			}
		}
	}

	if req.LevelNumber <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "level_number is required",
		})
		return
	}

	if h.DB == nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Database connection not available",
		})
		return
	}

	err := h.DB.SaveLevelWaypoints(r.Context(), req.LevelNumber, req.Waypoints)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Failed to save waypoints: " + err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Track waypoints saved to database successfully",
		"level":   req.LevelNumber,
		"count":   len(req.Waypoints),
	})
}
