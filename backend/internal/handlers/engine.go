package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

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
		// Fallback for offline/no-DB mode
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"source":  "fallback",
			"user": database.User{
				ID:         1,
				Username:   req.Username,
				Role:       req.Role,
				GroupID:    1,
				GroupName:  req.GroupName,
				Avatar:     req.Avatar,
				TotalXP:    req.InitialXP,
				TotalStars: 3,
			},
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

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"user":    user,
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

	if h.DB != nil {
		ctx := r.Context()

		// Upsert User Progress for Level
		_, err := h.DB.ExecContext(ctx, `
			INSERT INTO user_progress (user_id, level_number, stars, score, completed)
			VALUES (?, ?, ?, ?, TRUE)
			ON DUPLICATE KEY UPDATE stars = GREATEST(stars, VALUES(stars)), score = GREATEST(score, VALUES(score)), completed = TRUE
		`, req.UserID, req.LevelNumber, req.Stars, req.Score)

		if err == nil {
			// Update User Total XP & Total Stars
			_, _ = h.DB.ExecContext(ctx, `
				UPDATE users SET 
					total_xp = total_xp + ?,
					total_stars = (SELECT COALESCE(SUM(stars), 0) FROM user_progress WHERE user_id = ?)
				WHERE id = ?
			`, req.XPEarned, req.UserID, req.UserID)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Engine progress event recorded successfully",
	})
}

// GetLeaderboardHandler returns group-ranked leaderboard members
func (h *Handler) GetLeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	groupIDStr := r.URL.Query().Get("group_id")
	groupID := 1
	if groupIDStr != "" {
		if id, err := strconv.Atoi(groupIDStr); err == nil && id > 0 {
			groupID = id
		}
	}

	if h.DB != nil {
		rows, err := h.DB.QueryContext(r.Context(), `
			SELECT u.id, u.username, u.role, u.group_id, g.name, u.avatar, u.total_xp, u.total_stars
			FROM users u
			LEFT JOIN groups g ON u.group_id = g.id
			WHERE u.group_id = ?
			ORDER BY u.total_xp DESC, u.total_stars DESC
			LIMIT 25
		`, groupID)

		if err == nil {
			defer rows.Close()
			var members []database.User
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

			if len(members) > 0 {
				w.WriteHeader(http.StatusOK)
				_ = json.NewEncoder(w).Encode(map[string]interface{}{
					"success":  true,
					"group_id": groupID,
					"members":  members,
				})
				return
			}
		}
	}

	// Fallback mock leaderboard for offline mode
	fallbackMembers := []database.User{
		{ID: 1, Username: "Admin_Explorer", Role: "admin", GroupID: groupID, GroupName: "Jungle Explorers Group A", Avatar: "/monkey1.svg", TotalXP: 1450, TotalStars: 18},
		{ID: 2, Username: "Alex_Master", Role: "user", GroupID: groupID, GroupName: "Jungle Explorers Group A", Avatar: "/monkey2.svg", TotalXP: 1250, TotalStars: 15},
		{ID: 3, Username: "Monkey_Coder", Role: "user", GroupID: groupID, GroupName: "Jungle Explorers Group A", Avatar: "/monkey3.svg", TotalXP: 980, TotalStars: 12},
		{ID: 4, Username: "CodeNinja_99", Role: "user", GroupID: groupID, GroupName: "Jungle Explorers Group A", Avatar: "/monkey4.svg", TotalXP: 870, TotalStars: 9},
		{ID: 5, Username: "PixelQuest", Role: "user", GroupID: groupID, GroupName: "Jungle Explorers Group A", Avatar: "/monkey5.svg", TotalXP: 620, TotalStars: 6},
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"group_id": groupID,
		"members":  fallbackMembers,
	})
}

// GetGroupsHandler lists available groups
func (h *Handler) GetGroupsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	groups := []database.Group{
		{ID: 1, Name: "Jungle Explorers Group A", Code: "jungle-explorers-a"},
		{ID: 2, Name: "Code Academy Group B", Code: "code-academy-b"},
		{ID: 3, Name: "Scratch Masters Group C", Code: "scratch-masters-c"},
	}

	if h.DB != nil {
		rows, err := h.DB.QueryContext(r.Context(), "SELECT id, name, code FROM groups ORDER BY id ASC")
		if err == nil {
			defer rows.Close()
			var dbGroups []database.Group
			for rows.Next() {
				var g database.Group
				if err := rows.Scan(&g.ID, &g.Name, &g.Code); err == nil {
					dbGroups = append(dbGroups, g)
				}
			}
			if len(dbGroups) > 0 {
				groups = dbGroups
			}
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"groups":  groups,
	})
}
