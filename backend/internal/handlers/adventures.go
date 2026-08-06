package handlers

import (
	"encoding/json"
	"net/http"

	"backend/internal/database"
)

func (h *Handler) GetAdventuresHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if h.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Database connection not available",
		})
		return
	}

	rows, err := h.DB.QueryContext(r.Context(), "SELECT id, slug, title, story, learning_objective, total_levels FROM adventures")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	var adventures []database.Adventure
	for rows.Next() {
		var adv database.Adventure
		if err := rows.Scan(&adv.ID, &adv.Slug, &adv.Title, &adv.Story, &adv.LearningObjective, &adv.TotalLevels); err == nil {
			adventures = append(adventures, adv)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"adventures": adventures,
	})
}
