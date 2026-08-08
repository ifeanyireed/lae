package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"game_engine/internal/database"
)

type GameEngineHandler struct {
	DB    *database.DB
	Cache *database.Cache
}

func New(db *database.DB, cache *database.Cache) *GameEngineHandler {
	return &GameEngineHandler{DB: db, Cache: cache}
}

type LevelResponse struct {
	ID              int                      `json:"id"`
	AdventureID     int                      `json:"adventure_id"`
	LevelNumber     int                      `json:"level_number"`
	Title           string                   `json:"title"`
	Objective       string                   `json:"objective"`
	Mechanic        string                   `json:"mechanic"`
	MaxBlocks       int                      `json:"max_blocks"`
	AvailableBlocks []string                 `json:"available_blocks"`
	Waypoints       []database.LevelWaypoint `json:"waypoints,omitempty"`
}

type UpdateWaypointsRequest struct {
	WorldID     int                      `json:"world_id,omitempty"`
	AdventureID int                      `json:"adventure_id"`
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

// GetAdventuresHandler returns adventures from game_engine tables (cached in Redis)
func (g *GameEngineHandler) GetAdventuresHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	worldIDStr := r.URL.Query().Get("world_id")
	cacheKey := "game:adventures:all"
	if worldIDStr != "" {
		cacheKey = "game:adventures:world:" + worldIDStr
	}

	if cachedJSON, ok := g.Cache.Get(r.Context(), cacheKey); ok {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(cachedJSON))
		return
	}

	if g.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

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

	respObj := map[string]interface{}{
		"success":    true,
		"adventures": adventures,
	}
	respBytes, _ := json.Marshal(respObj)
	g.Cache.Set(r.Context(), cacheKey, string(respBytes), 1*time.Hour)

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(respBytes)
}

// GetLevelsHandler returns levels & waypoints from game_engine tables (cached in Redis)
func (g *GameEngineHandler) GetLevelsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	worldIDStr := r.URL.Query().Get("world_id")
	adventureIDStr := r.URL.Query().Get("adventure_id")

	worldID, _ := strconv.Atoi(worldIDStr)
	if worldID <= 0 {
		worldID = 1
	}

	advID, _ := strconv.Atoi(adventureIDStr)
	if advID <= 0 {
		advID = 1
	}

	dbAdvID := advID
	if worldID > 1 && advID <= 5 {
		dbAdvID = (worldID-1)*5 + advID
	}

	cacheKey := fmt.Sprintf("game:levels:w:%d:adv:%d", worldID, advID)
	if adventureIDStr == "" {
		cacheKey = fmt.Sprintf("game:levels:w:%d:all", worldID)
	}

	if cachedJSON, ok := g.Cache.Get(r.Context(), cacheKey); ok {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(cachedJSON))
		return
	}

	if g.DB != nil {
		var rows *sql.Rows
		var err error

		if adventureIDStr != "" {
			rows, err = g.DB.QueryContext(r.Context(), "SELECT id, adventure_id, level_number, title, objective, mechanic, max_blocks, available_blocks, waypoints FROM levels WHERE adventure_id = ? ORDER BY level_number ASC", dbAdvID)
		} else {
			rows, err = g.DB.QueryContext(r.Context(), "SELECT id, adventure_id, level_number, title, objective, mechanic, max_blocks, available_blocks, waypoints FROM levels ORDER BY level_number ASC")
		}

		if err == nil {
			defer rows.Close()
			var levels []LevelResponse
			for rows.Next() {
				var lvl LevelResponse
				var blocksRaw []byte
				var waypointsRaw []byte
				if err := rows.Scan(&lvl.ID, &lvl.AdventureID, &lvl.LevelNumber, &lvl.Title, &lvl.Objective, &lvl.Mechanic, &lvl.MaxBlocks, &blocksRaw, &waypointsRaw); err == nil {
					if len(blocksRaw) > 0 {
						_ = json.Unmarshal(blocksRaw, &lvl.AvailableBlocks)
					}
					if len(waypointsRaw) > 0 {
						_ = json.Unmarshal(waypointsRaw, &lvl.Waypoints)
					}
					levels = append(levels, lvl)
				}
			}
			if len(levels) > 0 {
				respObj := map[string]interface{}{
					"success": true,
					"source":  "database",
					"levels":  levels,
				}
				respBytes, _ := json.Marshal(respObj)
				g.Cache.Set(r.Context(), cacheKey, string(respBytes), 1*time.Hour)

				w.WriteHeader(http.StatusOK)
				_, _ = w.Write(respBytes)
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

// SaveWaypointsHandler updates waypoints JSON in game_engine levels table and invalidates Redis cache
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

	worldID := req.WorldID
	if worldID <= 0 {
		if worldStr := r.URL.Query().Get("world_id"); worldStr != "" {
			worldID, _ = strconv.Atoi(worldStr)
		}
	}
	if worldID <= 0 {
		worldID = 1
	}

	if req.AdventureID <= 0 {
		req.AdventureID = 1
	}

	dbAdvID := req.AdventureID
	if worldID > 1 && req.AdventureID <= 5 {
		dbAdvID = (worldID-1)*5 + req.AdventureID
	}

	err := g.DB.SaveLevelWaypoints(r.Context(), dbAdvID, req.LevelNumber, req.Waypoints)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	// Invalidate Redis cache for levels
	g.Cache.Del(r.Context(), "game:levels:all", fmt.Sprintf("game:levels:w:%d:adv:%d", worldID, req.AdventureID), "game:levels:adv:"+strconv.Itoa(req.AdventureID), "game:levels:adv:"+strconv.Itoa(dbAdvID))

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Track waypoints saved to database successfully",
		"level":   req.LevelNumber,
		"count":   len(req.Waypoints),
	})
}
