package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"game_engine/internal/database"
)

type GameEngineHandler struct {
	DB *database.DB
}

func New(db *database.DB) *GameEngineHandler {
	return &GameEngineHandler{DB: db}
}

type LevelResponse struct {
	ID          int                      `json:"id"`
	AdventureID int                      `json:"adventure_id"`
	LevelNumber int                      `json:"level_number"`
	Title       string                   `json:"title"`
	Objective   string                   `json:"objective"`
	Mechanic    string                   `json:"mechanic"`
	Waypoints   []database.LevelWaypoint `json:"waypoints,omitempty"`
}

type UpdateWaypointsRequest struct {
	LevelNumber int                      `json:"level_number"`
	Waypoints   []database.LevelWaypoint `json:"waypoints"`
}

// GetWorldsHandler returns worlds from game_engine tables
func (g *GameEngineHandler) GetWorldsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if g.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	rows, err := g.DB.QueryContext(r.Context(), "SELECT id, slug, name, description FROM worlds ORDER BY id ASC")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	var worlds []database.World
	for rows.Next() {
		var world database.World
		if err := rows.Scan(&world.ID, &world.Slug, &world.Name, &world.Description); err == nil {
			worlds = append(worlds, world)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"worlds":  worlds,
	})
}

// GetAdventuresHandler returns adventures from game_engine tables
func (g *GameEngineHandler) GetAdventuresHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if g.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	worldIDStr := r.URL.Query().Get("world_id")
	var rows *sql.Rows
	var err error

	if worldIDStr != "" {
		worldID, _ := strconv.Atoi(worldIDStr)
		rows, err = g.DB.QueryContext(r.Context(), "SELECT id, world_id, slug, title, concept, icon, story, learning_objective, total_levels FROM adventures WHERE world_id = ? ORDER BY id ASC", worldID)
	} else {
		rows, err = g.DB.QueryContext(r.Context(), "SELECT id, world_id, slug, title, concept, icon, story, learning_objective, total_levels FROM adventures ORDER BY id ASC")
	}

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	var adventures []database.Adventure
	for rows.Next() {
		var adv database.Adventure
		if err := rows.Scan(&adv.ID, &adv.WorldID, &adv.Slug, &adv.Title, &adv.Concept, &adv.Icon, &adv.Story, &adv.LearningObjective, &adv.TotalLevels); err == nil {
			adventures = append(adventures, adv)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"adventures": adventures,
	})
}

// GetLevelsHandler returns levels & waypoints from game_engine tables
func (g *GameEngineHandler) GetLevelsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if g.DB != nil {
		adventureIDStr := r.URL.Query().Get("adventure_id")
		var rows *sql.Rows
		var err error

		if adventureIDStr != "" {
			advID, _ := strconv.Atoi(adventureIDStr)
			rows, err = g.DB.QueryContext(r.Context(), "SELECT id, adventure_id, level_number, title, objective, mechanic, waypoints FROM levels WHERE adventure_id = ? ORDER BY level_number ASC", advID)
		} else {
			rows, err = g.DB.QueryContext(r.Context(), "SELECT id, adventure_id, level_number, title, objective, mechanic, waypoints FROM levels ORDER BY level_number ASC")
		}

		if err == nil {
			defer rows.Close()
			var levels []LevelResponse
			for rows.Next() {
				var lvl LevelResponse
				var waypointsRaw []byte
				if err := rows.Scan(&lvl.ID, &lvl.AdventureID, &lvl.LevelNumber, &lvl.Title, &lvl.Objective, &lvl.Mechanic, &waypointsRaw); err == nil {
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
		"levels":  []LevelResponse{},
	})
}

// SaveWaypointsHandler updates waypoints JSON in game_engine levels table
func (g *GameEngineHandler) SaveWaypointsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req UpdateWaypointsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
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
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "level_number is required"})
		return
	}

	if g.DB == nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	err := g.DB.SaveLevelWaypoints(r.Context(), req.LevelNumber, req.Waypoints)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
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
