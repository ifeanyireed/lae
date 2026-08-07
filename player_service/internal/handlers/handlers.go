package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"player_service/internal/database"
)

type PlayerServiceHandler struct {
	DB *database.DB
}

func New(db *database.DB) *PlayerServiceHandler {
	return &PlayerServiceHandler{DB: db}
}

type HandshakeRequest struct {
	Username  string `json:"username"`
	Role      string `json:"role"`
	GroupName string `json:"group_name"`
	GroupCode string `json:"group_code"`
	Avatar    string `json:"avatar"`
	InitialXP int    `json:"xp"`
}

type CodeLoginRequest struct {
	Code string `json:"code"`
}

type EventRequest struct {
	UserID      int `json:"user_id"`
	WorldID     int `json:"world_id,omitempty"`
	AdventureID int `json:"adventure_id,omitempty"`
	LevelNumber int `json:"level_number"`
	Stars       int `json:"stars"`
	Score       int `json:"score"`
	XPEarned    int `json:"xp_earned"`
}

type LevelProgressResponse struct {
	LevelNumber int  `json:"level_number"`
	AdventureID int  `json:"adventure_id,omitempty"`
	WorldID     int  `json:"world_id,omitempty"`
	Stars       int  `json:"stars"`
	Score       int  `json:"score"`
	Completed   bool `json:"completed"`
}

// HandshakeHandler processes Host platform player authentication
func (p *PlayerServiceHandler) HandshakeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req HandshakeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	if req.Username == "" {
		req.Username = "Explorer_Guest"
	}
	if req.Role != "admin" {
		req.Role = "user"
	}
	if req.GroupName == "" {
		req.GroupName = "Jungle Explorers Group A"
	}
	if req.GroupCode == "" {
		req.GroupCode = "jungle-explorers-a"
	}
	if req.Avatar == "" {
		req.Avatar = "/monkey1.svg"
	}

	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	ctx := r.Context()

	var groupID int
	err := p.DB.QueryRowContext(ctx, "SELECT id FROM groups WHERE code = ?", req.GroupCode).Scan(&groupID)
	if err != nil {
		res, err := p.DB.ExecContext(ctx, "INSERT INTO groups (name, code) VALUES (?, ?)", req.GroupName, req.GroupCode)
		if err == nil {
			id, _ := res.LastInsertId()
			groupID = int(id)
		} else {
			groupID = 1
		}
	}

	var user database.User
	err = p.DB.QueryRowContext(ctx, "SELECT id, username, role, group_id, avatar, total_xp, total_stars FROM users WHERE username = ?", req.Username).
		Scan(&user.ID, &user.Username, &user.Role, &user.GroupID, &user.Avatar, &user.TotalXP, &user.TotalStars)

	if err != nil {
		res, err := p.DB.ExecContext(ctx,
			"INSERT INTO users (username, role, group_id, avatar, total_xp, total_stars) VALUES (?, ?, ?, ?, ?, ?)",
			req.Username, req.Role, groupID, req.Avatar, req.InitialXP, 0,
		)
		if err == nil {
			id, _ := res.LastInsertId()
			user.ID = int(id)
			user.Username = req.Username
			user.Role = req.Role
			user.GroupID = groupID
			user.GroupName = req.GroupName
			user.Avatar = req.Avatar
			user.TotalXP = req.InitialXP
			user.TotalStars = 0
		}
	} else {
		user.Role = req.Role
		user.GroupID = groupID
		user.GroupName = req.GroupName
		_, _ = p.DB.ExecContext(ctx, "UPDATE users SET role = ?, group_id = ? WHERE id = ?", req.Role, groupID, user.ID)
	}

	progressList := p.getUserProgressList(ctx, user.ID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"user":     user,
		"progress": progressList,
	})
}

// CodeLoginHandler processes access code login for kids & admins
func (p *PlayerServiceHandler) CodeLoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req CodeLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	cleanCode := strings.TrimSpace(req.Code)
	if cleanCode == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Code is required"})
		return
	}

	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	ctx := r.Context()
	var user database.User
	err := p.DB.QueryRowContext(ctx,
		"SELECT id, username, access_code, role, group_id, avatar, total_xp, total_stars FROM users WHERE access_code = ?",
		cleanCode,
	).Scan(&user.ID, &user.Username, &user.AccessCode, &user.Role, &user.GroupID, &user.Avatar, &user.TotalXP, &user.TotalStars)

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid access code. Please check your code and try again.",
		})
		return
	}

	var groupName string
	_ = p.DB.QueryRowContext(ctx, "SELECT name FROM groups WHERE id = ?", user.GroupID).Scan(&groupName)
	user.GroupName = groupName

	progressList := p.getUserProgressList(ctx, user.ID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"user":     user,
		"progress": progressList,
	})
}

// VerifySessionHandler verifies active player session
func (p *PlayerServiceHandler) VerifySessionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := r.URL.Query().Get("user_id")
	userID, _ := strconv.Atoi(userIDStr)
	if userID <= 0 {
		userID = 1
	}

	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "valid": true, "user_id": userID})
		return
	}

	var user database.User
	err := p.DB.QueryRowContext(r.Context(), "SELECT id, username, role, group_id, avatar, total_xp, total_stars FROM users WHERE id = ?", userID).
		Scan(&user.ID, &user.Username, &user.Role, &user.GroupID, &user.Avatar, &user.TotalXP, &user.TotalStars)

	if err != nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "valid": false})
		return
	}

	progressList := p.getUserProgressList(r.Context(), user.ID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"valid":    true,
		"user":     user,
		"progress": progressList,
	})
}

// EventHandler records player stage completion & XP in player_service tables
func (p *PlayerServiceHandler) EventHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req EventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	if req.UserID <= 0 {
		req.UserID = 1
	}
	if req.LevelNumber <= 0 {
		req.LevelNumber = 1
	}
	if req.WorldID <= 0 {
		req.WorldID = 1
	}
	if req.AdventureID <= 0 {
		req.AdventureID = 1
	}
	if req.Stars <= 0 {
		req.Stars = 3
	}

	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "source": "fallback"})
		return
	}

	ctx := r.Context()

	_, err := p.DB.ExecContext(ctx, `
		INSERT INTO user_progress (user_id, world_id, adventure_id, level_number, stars, score, completed)
		VALUES (?, ?, ?, ?, ?, ?, TRUE)
		ON DUPLICATE KEY UPDATE
			stars = GREATEST(stars, VALUES(stars)),
			score = GREATEST(score, VALUES(score)),
			completed = TRUE
	`, req.UserID, req.WorldID, req.AdventureID, req.LevelNumber, req.Stars, req.Score)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	var newXP, newStars int
	err = p.DB.QueryRowContext(ctx, `
		SELECT COALESCE(SUM(score), 0), COALESCE(SUM(stars), 0)
		FROM user_progress WHERE user_id = ? AND completed = TRUE
	`, req.UserID).Scan(&newXP, &newStars)

	if err == nil {
		_, _ = p.DB.ExecContext(ctx, "UPDATE users SET total_xp = ?, total_stars = ? WHERE id = ?", newXP, newStars, req.UserID)
	}

	progressList := p.getUserProgressList(ctx, req.UserID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"total_xp": newXP,
		"stars":    newStars,
		"progress": progressList,
	})
}

// GetProgressHandler returns player progress list from player_service tables
func (p *PlayerServiceHandler) GetProgressHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := r.URL.Query().Get("user_id")
	userID, _ := strconv.Atoi(userIDStr)
	if userID <= 0 {
		userID = 1
	}

	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	ctx := r.Context()
	var totalXP int
	_ = p.DB.QueryRowContext(ctx, "SELECT total_xp FROM users WHERE id = ?", userID).Scan(&totalXP)

	progressList := p.getUserProgressList(ctx, userID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"total_xp": totalXP,
		"progress": progressList,
	})
}

// GetLeaderboardHandler returns group & global player leaderboards
func (p *PlayerServiceHandler) GetLeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	groupIDStr := r.URL.Query().Get("group_id")
	groupID, _ := strconv.Atoi(groupIDStr)

	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "leaderboard": []interface{}{}})
		return
	}

	ctx := r.Context()
	var query string
	var args []interface{}

	if groupID > 0 {
		query = "SELECT id, username, avatar, total_xp, total_stars FROM users WHERE group_id = ? ORDER BY total_xp DESC LIMIT 20"
		args = append(args, groupID)
	} else {
		query = "SELECT id, username, avatar, total_xp, total_stars FROM users ORDER BY total_xp DESC LIMIT 20"
	}

	rows, err := p.DB.QueryContext(ctx, query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	type LeaderboardEntry struct {
		ID         int    `json:"id"`
		Username   string `json:"username"`
		Avatar     string `json:"avatar"`
		TotalXP    int    `json:"total_xp"`
		TotalStars int    `json:"total_stars"`
	}

	var leaderboard []LeaderboardEntry
	for rows.Next() {
		var entry LeaderboardEntry
		if err := rows.Scan(&entry.ID, &entry.Username, &entry.Avatar, &entry.TotalXP, &entry.TotalStars); err == nil {
			leaderboard = append(leaderboard, entry)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"leaderboard": leaderboard,
	})
}

// GetGroupsHandler returns group list from player_service tables
func (p *PlayerServiceHandler) GetGroupsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "groups": []interface{}{}})
		return
	}

	rows, err := p.DB.QueryContext(r.Context(), "SELECT id, name, code FROM groups ORDER BY id ASC")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	var groups []database.Group
	for rows.Next() {
		var g database.Group
		if err := rows.Scan(&g.ID, &g.Name, &g.Code); err == nil {
			groups = append(groups, g)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"groups":  groups,
	})
}

func (p *PlayerServiceHandler) getUserProgressList(ctx context.Context, userID int) []LevelProgressResponse {
	list := make([]LevelProgressResponse, 0)
	if p.DB == nil || userID <= 0 {
		return list
	}

	rows, err := p.DB.QueryContext(ctx, "SELECT level_number, adventure_id, world_id, stars, score, completed FROM user_progress WHERE user_id = ? ORDER BY level_number ASC", userID)
	if err != nil {
		return list
	}
	defer rows.Close()

	for rows.Next() {
		var resp LevelProgressResponse
		if err := rows.Scan(&resp.LevelNumber, &resp.AdventureID, &resp.WorldID, &resp.Stars, &resp.Score, &resp.Completed); err == nil {
			list = append(list, resp)
		}
	}
	return list
}
