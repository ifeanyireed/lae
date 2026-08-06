package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"backend/internal/database"
)

type HandshakeRequest struct {
	Username  string `json:"username"`
	Role      string `json:"role"`       // "admin" or "user"
	GroupName string `json:"group_name"`  // e.g. "Jungle Explorers Group A"
	GroupCode string `json:"group_code"`  // e.g. "jungle-a"
	Avatar    string `json:"avatar"`
	InitialXP int    `json:"xp"`
}

type CodeLoginRequest struct {
	Code string `json:"code"`
}

type EventRequest struct {
	UserID      int `json:"user_id"`
	LevelNumber int `json:"level_number"`
	Stars       int `json:"stars"`
	Score       int `json:"score"`
	XPEarned    int `json:"xp_earned"`
}

// HandshakeHandler processes Host platform authentication handshake
func (h *Handler) HandshakeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req HandshakeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
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

	if h.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Database connection unavailable",
		})
		return
	}

	ctx := r.Context()

	// 1. Ensure Group Exists
	var groupID int
	err := h.DB.QueryRowContext(ctx, "SELECT id FROM groups WHERE code = ?", req.GroupCode).Scan(&groupID)
	if err != nil {
		res, err := h.DB.ExecContext(ctx, "INSERT INTO groups (name, code) VALUES (?, ?)", req.GroupName, req.GroupCode)
		if err == nil {
			id, _ := res.LastInsertId()
			groupID = int(id)
		} else {
			groupID = 1
		}
	}

	// 2. Ensure User Exists / Update Session Context
	var user database.User
	err = h.DB.QueryRowContext(ctx, "SELECT id, username, role, group_id, avatar, total_xp, total_stars FROM users WHERE username = ?", req.Username).
		Scan(&user.ID, &user.Username, &user.Role, &user.GroupID, &user.Avatar, &user.TotalXP, &user.TotalStars)

	if err != nil {
		// Insert New User
		res, err := h.DB.ExecContext(ctx,
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
		// Update existing user role/group if updated by host
		user.Role = req.Role
		user.GroupID = groupID
		user.GroupName = req.GroupName
		_, _ = h.DB.ExecContext(ctx, "UPDATE users SET role = ?, group_id = ? WHERE id = ?", req.Role, groupID, user.ID)
	}

	progressList := h.getUserProgressList(ctx, user.ID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"user":     user,
		"progress": progressList,
	})
}

type LevelProgressResponse struct {
	LevelNumber int  `json:"level_number"`
	Stars       int  `json:"stars"`
	Score       int  `json:"score"`
	Completed   bool `json:"completed"`
}

func (h *Handler) getUserProgressList(ctx context.Context, userID int) []LevelProgressResponse {
	list := make([]LevelProgressResponse, 0)
	if h.DB == nil || userID <= 0 {
		return list
	}

	rows, err := h.DB.QueryContext(ctx, "SELECT level_number, stars, score, completed FROM user_progress WHERE user_id = ? ORDER BY level_number ASC", userID)
	if err != nil {
		return list
	}
	defer rows.Close()

	for rows.Next() {
		var p LevelProgressResponse
		if err := rows.Scan(&p.LevelNumber, &p.Stars, &p.Score, &p.Completed); err == nil {
			list = append(list, p)
		}
	}
	return list
}

// GetProgressHandler returns user progress directly from database
func (h *Handler) GetProgressHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userIDStr := r.URL.Query().Get("user_id")
	userID, _ := strconv.Atoi(userIDStr)
	if userID <= 0 {
		userID = 1
	}

	if h.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Database connection unavailable",
		})
		return
	}

	ctx := r.Context()
	progress := h.getUserProgressList(ctx, userID)

	var totalXP, totalStars int
	_ = h.DB.QueryRowContext(ctx, "SELECT total_xp, total_stars FROM users WHERE id = ?", userID).Scan(&totalXP, &totalStars)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"user_id":     userID,
		"total_xp":    totalXP,
		"total_stars": totalStars,
		"progress":    progress,
	})
}

// EventHandler records stage clear progress callbacks and updates XP/Stars
func (h *Handler) EventHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req EventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	if req.UserID <= 0 {
		req.UserID = 1
	}

	if h.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Database connection unavailable",
		})
		return
	}

	ctx := r.Context()

	// Upsert User Progress for Level
	_, err := h.DB.ExecContext(ctx, `
		INSERT INTO user_progress (user_id, level_number, stars, score, completed)
		VALUES (?, ?, ?, ?, TRUE)
		ON DUPLICATE KEY UPDATE stars = GREATEST(stars, VALUES(stars)), score = GREATEST(score, VALUES(score)), completed = TRUE
	`, req.UserID, req.LevelNumber, req.Stars, req.Score)

	var currentXP int
	if err == nil {
		// Update User Total XP & Total Stars
		_, _ = h.DB.ExecContext(ctx, `
			UPDATE users SET 
				total_xp = total_xp + ?,
				total_stars = (SELECT COALESCE(SUM(stars), 0) FROM user_progress WHERE user_id = ?)
			WHERE id = ?
		`, req.XPEarned, req.UserID, req.UserID)

		_ = h.DB.QueryRowContext(ctx, "SELECT total_xp FROM users WHERE id = ?", req.UserID).Scan(&currentXP)
	}

	progressList := h.getUserProgressList(ctx, req.UserID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"total_xp": currentXP,
		"progress": progressList,
		"message":  "Engine progress event recorded successfully",
	})
}

// GetLeaderboardHandler returns group-ranked leaderboard members directly from database
func (h *Handler) GetLeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	groupIDStr := r.URL.Query().Get("group_id")
	groupID := 1
	if groupIDStr != "" {
		if id, err := strconv.Atoi(groupIDStr); err == nil && id > 0 {
			groupID = id
		}
	}

	if h.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Database connection unavailable",
		})
		return
	}

	rows, err := h.DB.QueryContext(r.Context(), `
		SELECT u.id, u.username, u.role, u.group_id, g.name, u.avatar, u.total_xp, u.total_stars
		FROM users u
		LEFT JOIN groups g ON u.group_id = g.id
		WHERE u.group_id = ?
		ORDER BY u.total_xp DESC, u.total_stars DESC
		LIMIT 25
	`, groupID)

	var members []database.User = make([]database.User, 0)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var u database.User
			var gName *string
			if err := rows.Scan(&u.ID, &u.Username, &u.Role, &u.GroupID, &gName, &u.Avatar, &u.TotalXP, &u.TotalStars); err == nil {
				if gName != nil {
					u.GroupName = *gName
				}
				members = append(members, u)
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"group_id": groupID,
		"members":  members,
	})
}

// GetGroupsHandler lists available groups directly from database
func (h *Handler) GetGroupsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if h.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Database connection unavailable",
		})
		return
	}

	var groups []database.Group = make([]database.Group, 0)
	rows, err := h.DB.QueryContext(r.Context(), "SELECT id, name, code FROM groups ORDER BY id ASC")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var g database.Group
			if err := rows.Scan(&g.ID, &g.Name, &g.Code); err == nil {
				groups = append(groups, g)
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"groups":  groups,
	})
}

// CodeLoginHandler logs in a user or kid via their access code
func (h *Handler) CodeLoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req CodeLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Code == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Valid game code is required",
		})
		return
	}

	rawCode := strings.ReplaceAll(strings.TrimSpace(strings.ToUpper(req.Code)), "-", "")
	formattedCode := strings.TrimSpace(strings.ToUpper(req.Code))
	if len(rawCode) == 8 {
		formattedCode = rawCode[:4] + "-" + rawCode[4:]
	}

	if h.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Database connection unavailable",
		})
		return
	}

	ctx := r.Context()

	var user database.User
	err := h.DB.QueryRowContext(ctx, `
		SELECT u.id, u.username, COALESCE(u.access_code, ''), u.role, u.group_id, COALESCE(g.name, 'Jungle Explorers Group A'), u.avatar, u.total_xp, u.total_stars 
		FROM users u
		LEFT JOIN groups g ON u.group_id = g.id
		WHERE UPPER(u.access_code) = ? OR UPPER(u.username) = ? OR UPPER(u.access_code) = ?
	`, formattedCode, rawCode, rawCode).
		Scan(&user.ID, &user.Username, &user.AccessCode, &user.Role, &user.GroupID, &user.GroupName, &user.Avatar, &user.TotalXP, &user.TotalStars)

	if err != nil {
		// Auto-generate or match new Cadet explorer for this code
		newUsername := "Cadet_" + formattedCode
		role := "user"
		if strings.HasPrefix(formattedCode, "ADMN") || strings.HasPrefix(formattedCode, "ADMIN") {
			role = "admin"
			newUsername = "Admin_Explorer"
		}

		res, err := h.DB.ExecContext(ctx, `
			INSERT INTO users (username, access_code, role, group_id, avatar, total_xp, total_stars)
			VALUES (?, ?, ?, 1, '/monkey1.svg', 0, 0)
		`, newUsername, formattedCode, role)

		if err == nil {
			id, _ := res.LastInsertId()
			user.ID = int(id)
			user.Username = newUsername
			user.AccessCode = formattedCode
			user.Role = role
			user.GroupID = 1
			user.GroupName = "Jungle Explorers Group A"
			user.Avatar = "/monkey1.svg"
			user.TotalXP = 0
			user.TotalStars = 0
		} else {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"error":   "Invalid Code. Contact your Teacher or Guardian.",
			})
			return
		}
	}

	progressList := h.getUserProgressList(ctx, user.ID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"user":     user,
		"token":    "PUZZLEPRO_" + user.AccessCode,
		"progress": progressList,
	})
}

// VerifySessionHandler verifies a session code or token and returns full user context and DB progress
func (h *Handler) VerifySessionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	code := r.URL.Query().Get("code")
	if code == "" {
		token := r.Header.Get("Authorization")
		if strings.HasPrefix(token, "Bearer ") {
			code = strings.TrimPrefix(token, "Bearer ")
		}
	}

	cleanCode := strings.ToUpper(strings.TrimSpace(code))
	if len(cleanCode) == 8 && !strings.Contains(cleanCode, "-") {
		cleanCode = cleanCode[:4] + "-" + cleanCode[4:]
	}

	if cleanCode == "" {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Session token or code is required",
		})
		return
	}

	if h.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Database connection unavailable",
		})
		return
	}

	ctx := r.Context()
	var user database.User
	err := h.DB.QueryRowContext(ctx, "SELECT id, username, access_code, role, group_id, avatar, total_xp, total_stars FROM users WHERE access_code = ? OR username = ?", cleanCode, cleanCode).
		Scan(&user.ID, &user.Username, &user.AccessCode, &user.Role, &user.GroupID, &user.Avatar, &user.TotalXP, &user.TotalStars)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Session invalid",
		})
		return
	}

	progressList := h.getUserProgressList(ctx, user.ID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"user":     user,
		"token":    "PUZZLEPRO_" + user.AccessCode,
		"progress": progressList,
	})
}
