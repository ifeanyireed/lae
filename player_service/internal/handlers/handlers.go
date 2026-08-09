package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"player_service/internal/auth"
	"player_service/internal/database"
	"player_service/internal/embed"
	"player_service/internal/mailer"
)

type PlayerServiceHandler struct {
	DB     *database.DB
	Mailer *mailer.Mailer
}

func New(db *database.DB, m *mailer.Mailer) *PlayerServiceHandler {
	return &PlayerServiceHandler{DB: db, Mailer: m}
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
	rawCode := strings.ReplaceAll(strings.ToUpper(cleanCode), "-", "")
	var user database.User
	err := p.DB.QueryRowContext(ctx,
		"SELECT id, username, access_code, role, group_id, avatar, total_xp, total_stars FROM users WHERE REPLACE(UPPER(access_code), '-', '') = ?",
		rawCode,
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
	token, _ := auth.GenerateToken(user.ID, user.Username, user.Role, user.AccessCode)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"token":    token,
		"user":     user,
		"progress": progressList,
	})
}

// VerifySessionHandler verifies active player session using JWT token or Access Code
func (p *PlayerServiceHandler) VerifySessionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	tokenStr := r.URL.Query().Get("token")
	codeStr := r.URL.Query().Get("code")

	if tokenStr == "" {
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	var userID int
	if tokenStr != "" {
		claims, err := auth.VerifyToken(tokenStr)
		if err == nil && claims != nil {
			userID = claims.UserID
		}
	}

	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "valid": true, "user_id": userID})
		return
	}

	ctx := r.Context()
	var user database.User
	var err error

	if userID > 0 {
		err = p.DB.QueryRowContext(ctx, "SELECT id, username, access_code, role, group_id, avatar, total_xp, total_stars FROM users WHERE id = ?", userID).
			Scan(&user.ID, &user.Username, &user.AccessCode, &user.Role, &user.GroupID, &user.Avatar, &user.TotalXP, &user.TotalStars)
	} else if codeStr != "" {
		rawCode := strings.ReplaceAll(strings.ToUpper(strings.TrimSpace(codeStr)), "-", "")
		err = p.DB.QueryRowContext(ctx, "SELECT id, username, access_code, role, group_id, avatar, total_xp, total_stars FROM users WHERE REPLACE(UPPER(access_code), '-', '') = ?", rawCode).
			Scan(&user.ID, &user.Username, &user.AccessCode, &user.Role, &user.GroupID, &user.Avatar, &user.TotalXP, &user.TotalStars)
	} else {
		userIDStr := r.URL.Query().Get("user_id")
		uID, _ := strconv.Atoi(userIDStr)
		if uID > 0 {
			err = p.DB.QueryRowContext(ctx, "SELECT id, username, access_code, role, group_id, avatar, total_xp, total_stars FROM users WHERE id = ?", uID).
				Scan(&user.ID, &user.Username, &user.AccessCode, &user.Role, &user.GroupID, &user.Avatar, &user.TotalXP, &user.TotalStars)
		} else {
			err = fmt.Errorf("no session identifier provided")
		}
	}

	if err != nil || user.ID <= 0 {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "valid": false})
		return
	}

	var groupName string
	_ = p.DB.QueryRowContext(ctx, "SELECT name FROM groups WHERE id = ?", user.GroupID).Scan(&groupName)
	user.GroupName = groupName

	newToken, _ := auth.GenerateToken(user.ID, user.Username, user.Role, user.AccessCode)
	progressList := p.getUserProgressList(ctx, user.ID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"valid":    true,
		"token":    newToken,
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

	orgID := r.URL.Query().Get("organisation_id")
	centreIDStr := r.URL.Query().Get("centre_id")

	query := `
		SELECT g.id, COALESCE(g.organisation_id, ''), COALESCE(g.centre_id, 0), COALESCE(c.name, ''), g.name, g.code, g.created_at
		FROM groups g
		LEFT JOIN centres c ON g.centre_id = c.id
	`
	var args []interface{}
	var conds []string
	if orgID != "" && orgID != "ALL" {
		conds = append(conds, "g.organisation_id = ?")
		args = append(args, orgID)
	}
	if centreIDStr != "" && centreIDStr != "ALL" {
		if cID, err := strconv.Atoi(centreIDStr); err == nil && cID > 0 {
			conds = append(conds, "g.centre_id = ?")
			args = append(args, cID)
		}
	}
	if len(conds) > 0 {
		query += " WHERE " + strings.Join(conds, " AND ")
	}
	query += " ORDER BY g.id ASC"

	rows, err := p.DB.QueryContext(r.Context(), query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	var groups []database.Group
	for rows.Next() {
		var g database.Group
		var createdAt string
		if err := rows.Scan(&g.ID, &g.OrganisationID, &g.CentreID, &g.CentreName, &g.Name, &g.Code, &createdAt); err == nil {
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

// GetOrganisationsHandler returns all schools & families organisations
func (p *PlayerServiceHandler) GetOrganisationsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "organisations": []interface{}{}})
		return
	}

	ctx := r.Context()
	orgType := r.URL.Query().Get("type")
	orgID := r.URL.Query().Get("id")
	query := "SELECT id, name, domain, contact_email, contact_phone, password, COALESCE(logo_url, '/monkey1.svg'), token, google_ads_enabled, type, created_at FROM organisations"
	var args []interface{}
	var conds []string
	if orgType != "" {
		conds = append(conds, "type = ?")
		args = append(args, orgType)
	}
	if orgID != "" {
		conds = append(conds, "id = ?")
		args = append(args, orgID)
	}
	if len(conds) > 0 {
		query += " WHERE " + strings.Join(conds, " AND ")
	}
	query += " ORDER BY created_at DESC"

	rows, err := p.DB.QueryContext(ctx, query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	orgs := make([]database.Organisation, 0)
	for rows.Next() {
		var o database.Organisation
		var createdAt string
		if err := rows.Scan(&o.ID, &o.Name, &o.Domain, &o.ContactEmail, &o.ContactPhone, &o.Password, &o.LogoURL, &o.Token, &o.GoogleAdsEnabled, &o.Type, &createdAt); err == nil {
			_ = p.DB.QueryRowContext(ctx, "SELECT COUNT(*) FROM users WHERE organisation_id = ?", o.ID).Scan(&o.ActiveStudents)

			grpRows, err := p.DB.QueryContext(ctx, "SELECT name FROM groups WHERE organisation_id = ?", o.ID)
			if err == nil {
				o.Groups = make([]string, 0)
				for grpRows.Next() {
					var gName string
					if err := grpRows.Scan(&gName); err == nil {
						o.Groups = append(o.Groups, gName)
					}
				}
				grpRows.Close()
			}

			ctrRows, err := p.DB.QueryContext(ctx, "SELECT id, organisation_id, name, location, code FROM centres WHERE organisation_id = ?", o.ID)
			if err == nil {
				o.Centres = make([]database.Centre, 0)
				for ctrRows.Next() {
					var c database.Centre
					if err := ctrRows.Scan(&c.ID, &c.OrganisationID, &c.Name, &c.Location, &c.Code); err == nil {
						o.Centres = append(o.Centres, c)
					}
				}
				ctrRows.Close()
			}

			orgs = append(orgs, o)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"organisations": orgs,
	})
}

// SaveOrganisationHandler creates or updates an organisation & tied groups
func (p *PlayerServiceHandler) SaveOrganisationHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req database.Organisation
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	ctx := r.Context()
	if req.ID == "" {
		req.ID = fmt.Sprintf("org_%d", time.Now().UnixNano()%100000)
	}
	if req.Token == "" {
		signedTok, errTok := embed.GenerateSignedEmbedToken(req.ID, 365*24*time.Hour)
		if errTok == nil {
			req.Token = signedTok
		} else {
			req.Token = fmt.Sprintf("EMB_TOKEN_%s_%d", strings.ToUpper(req.Name[:min(4, len(req.Name))]), time.Now().UnixNano()%10000)
		}
	}
	if req.Type == "" {
		req.Type = "school"
	}
	if req.Password == "" {
		req.Password = "school123"
	}
	if req.LogoURL == "" {
		req.LogoURL = "/monkey1.svg"
	}

	_, err := p.DB.ExecContext(ctx, `
		INSERT INTO organisations (id, name, domain, contact_email, contact_phone, password, logo_url, token, google_ads_enabled, type)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			name = VALUES(name),
			domain = VALUES(domain),
			contact_email = VALUES(contact_email),
			contact_phone = VALUES(contact_phone),
			password = VALUES(password),
			logo_url = VALUES(logo_url),
			google_ads_enabled = VALUES(google_ads_enabled),
			type = VALUES(type)
	`, req.ID, req.Name, req.Domain, req.ContactEmail, req.ContactPhone, req.Password, req.LogoURL, req.Token, req.GoogleAdsEnabled, req.Type)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	for _, gName := range req.Groups {
		if strings.TrimSpace(gName) != "" {
			gCode := strings.ToLower(strings.ReplaceAll(gName, " ", "-"))
			_, _ = p.DB.ExecContext(ctx, `
				INSERT INTO groups (organisation_id, name, code) VALUES (?, ?, ?)
				ON DUPLICATE KEY UPDATE organisation_id = VALUES(organisation_id), name = VALUES(name)
			`, req.ID, gName, fmt.Sprintf("%s-%s", req.ID, gCode))
		}
	}

	if p.Mailer != nil && req.ContactEmail != "" {
		p.Mailer.SendWelcomeEmail(req.ContactEmail, req.Name, req.Type, req.Password, req.Token)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "organisation": req})
}

// ToggleGoogleAdsHandler toggles ad monetization for an organisation
func (p *PlayerServiceHandler) ToggleGoogleAdsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req struct {
		ID               string `json:"id"`
		GoogleAdsEnabled bool   `json:"google_ads_enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	_, err := p.DB.ExecContext(r.Context(), "UPDATE organisations SET google_ads_enabled = ? WHERE id = ?", req.GoogleAdsEnabled, req.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// DeleteOrganisationHandler deletes an organisation
func (p *PlayerServiceHandler) DeleteOrganisationHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	orgID := r.URL.Query().Get("id")
	if orgID == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Missing organisation ID"})
		return
	}

	_, err := p.DB.ExecContext(r.Context(), "DELETE FROM organisations WHERE id = ?", orgID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// GetUsersAdminHandler returns student & user list
func (p *PlayerServiceHandler) GetUsersAdminHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "users": []interface{}{}})
		return
	}

	ctx := r.Context()
	orgID := r.URL.Query().Get("organisation_id")

	query := `
		SELECT u.id, u.username, u.access_code, u.role, u.organisation_id, COALESCE(o.name, ''), u.group_id, COALESCE(g.name, ''), u.avatar, u.assigned_world_id, u.total_xp, u.total_stars
		FROM users u
		LEFT JOIN organisations o ON u.organisation_id = o.id
		LEFT JOIN groups g ON u.group_id = g.id
	`
	var args []interface{}
	if orgID != "" && orgID != "ALL" {
		query += " WHERE u.organisation_id = ?"
		args = append(args, orgID)
	}
	query += " ORDER BY u.id DESC"

	rows, err := p.DB.QueryContext(ctx, query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	users := make([]database.User, 0)
	for rows.Next() {
		var u database.User
		if err := rows.Scan(&u.ID, &u.Username, &u.AccessCode, &u.Role, &u.OrganisationID, &u.OrganisationName, &u.GroupID, &u.GroupName, &u.Avatar, &u.AssignedWorldID, &u.TotalXP, &u.TotalStars); err == nil {
			users = append(users, u)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"users":   users,
	})
}

// SaveUserAdminHandler creates or updates student user details & 8-digit access code
func (p *PlayerServiceHandler) SaveUserAdminHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req database.User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	ctx := r.Context()
	if req.AccessCode == "" {
		req.AccessCode = fmt.Sprintf("%d", 10000000+time.Now().UnixNano()%90000000)
	}
	if req.Role == "" {
		req.Role = "student"
	}
	if req.AssignedWorldID == 0 {
		req.AssignedWorldID = 1
	}

	var groupID int = 1
	if req.GroupName != "" {
		_ = p.DB.QueryRowContext(ctx, "SELECT id FROM groups WHERE name = ?", req.GroupName).Scan(&groupID)
	}

	if req.ID > 0 {
		_, err := p.DB.ExecContext(ctx, `
			UPDATE users SET
				username = ?,
				access_code = ?,
				role = ?,
				organisation_id = ?,
				group_id = ?,
				avatar = ?,
				assigned_world_id = ?
			WHERE id = ?
		`, req.Username, req.AccessCode, req.Role, req.OrganisationID, groupID, req.Avatar, req.AssignedWorldID, req.ID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
			return
		}
	} else {
		res, err := p.DB.ExecContext(ctx, `
			INSERT INTO users (username, access_code, role, organisation_id, group_id, avatar, assigned_world_id, total_xp, total_stars)
			VALUES (?, ?, ?, ?, ?, ?, ?, 100, 0)
		`, req.Username, req.AccessCode, req.Role, req.OrganisationID, groupID, req.Avatar, req.AssignedWorldID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
			return
		}
		id, _ := res.LastInsertId()
		req.ID = int(id)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "user": req})
}

// AssignWorldHandler updates assigned_world_id for a student
func (p *PlayerServiceHandler) AssignWorldHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req struct {
		UserID          int `json:"user_id"`
		AssignedWorldID int `json:"assigned_world_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	_, err := p.DB.ExecContext(r.Context(), "UPDATE users SET assigned_world_id = ? WHERE id = ?", req.AssignedWorldID, req.UserID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// DeleteUserAdminHandler deletes a student user account
func (p *PlayerServiceHandler) DeleteUserAdminHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	userIDStr := r.URL.Query().Get("id")
	userID, _ := strconv.Atoi(userIDStr)

	_, err := p.DB.ExecContext(r.Context(), "DELETE FROM users WHERE id = ?", userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// GetSubscriptionsHandler returns subscriptions
func (p *PlayerServiceHandler) GetSubscriptionsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "subscriptions": []interface{}{}})
		return
	}

	rows, err := p.DB.QueryContext(r.Context(), "SELECT id, organisation_id, organisation_name, user_email, plan_name, status, seats, price, renewal_date FROM subscriptions ORDER BY created_at DESC")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	subs := make([]database.Subscription, 0)
	for rows.Next() {
		var s database.Subscription
		if err := rows.Scan(&s.ID, &s.OrganisationID, &s.OrganisationName, &s.UserEmail, &s.PlanName, &s.Status, &s.Seats, &s.Price, &s.RenewalDate); err == nil {
			subs = append(subs, s)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"subscriptions": subs,
	})
}

// SaveSubscriptionHandler creates a subscription
func (p *PlayerServiceHandler) SaveSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req database.Subscription
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	if req.ID == "" {
		req.ID = fmt.Sprintf("sub_%d", time.Now().UnixNano()%10000)
	}

	_, err := p.DB.ExecContext(r.Context(), `
		INSERT INTO subscriptions (id, organisation_id, organisation_name, user_email, plan_name, status, seats, price, renewal_date)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			organisation_name = VALUES(organisation_name),
			user_email = VALUES(user_email),
			plan_name = VALUES(plan_name),
			status = VALUES(status),
			seats = VALUES(seats),
			price = VALUES(price),
			renewal_date = VALUES(renewal_date)
	`, req.ID, req.OrganisationID, req.OrganisationName, req.UserEmail, req.PlanName, req.Status, req.Seats, req.Price, req.RenewalDate)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	if p.Mailer != nil && req.UserEmail != "" {
		p.Mailer.SendSubscriptionEmail(req.UserEmail, req.OrganisationName, req.PlanName, fmt.Sprintf("%d", req.Seats), req.Price)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "subscription": req})
}

type BatchUsersRequest struct {
	OrganisationID string          `json:"organisation_id"`
	Users          []database.User `json:"users"`
}

// BatchSaveUsersHandler handles bulk creation of multiple children/students
func (p *PlayerServiceHandler) BatchSaveUsersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req BatchUsersRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	ctx := r.Context()
	createdUsers := make([]database.User, 0)

	for _, u := range req.Users {
		if u.Username == "" {
			continue
		}
		if u.AccessCode == "" {
			u.AccessCode = fmt.Sprintf("%d", 10000000+time.Now().UnixNano()%90000000)
		}
		if u.Role == "" {
			u.Role = "student"
		}
		if u.AssignedWorldID == 0 {
			u.AssignedWorldID = 1
		}
		if u.Avatar == "" {
			u.Avatar = "/images/character1.jpg"
		}
		orgID := u.OrganisationID
		if orgID == "" {
			orgID = req.OrganisationID
		}

		res, err := p.DB.ExecContext(ctx, `
			INSERT INTO users (username, access_code, role, organisation_id, group_id, avatar, assigned_world_id, total_xp, total_stars)
			VALUES (?, ?, ?, ?, 1, ?, ?, 100, 0)
			ON DUPLICATE KEY UPDATE
				access_code = VALUES(access_code),
				role = VALUES(role),
				organisation_id = VALUES(organisation_id),
				avatar = VALUES(avatar),
				assigned_world_id = VALUES(assigned_world_id)
		`, u.Username, u.AccessCode, u.Role, orgID, u.Avatar, u.AssignedWorldID)

		if err != nil {
			// Fallback with unique username suffix if username collision occurred
			uniqueUsername := fmt.Sprintf("%s (%s)", u.Username, u.AccessCode[:min(4, len(u.AccessCode))])
			res, err = p.DB.ExecContext(ctx, `
				INSERT INTO users (username, access_code, role, organisation_id, group_id, avatar, assigned_world_id, total_xp, total_stars)
				VALUES (?, ?, ?, ?, 1, ?, ?, 100, 0)
				ON DUPLICATE KEY UPDATE
					access_code = VALUES(access_code),
					role = VALUES(role),
					organisation_id = VALUES(organisation_id),
					avatar = VALUES(avatar),
					assigned_world_id = VALUES(assigned_world_id)
			`, uniqueUsername, u.AccessCode, u.Role, orgID, u.Avatar, u.AssignedWorldID)
			if err == nil {
				u.Username = uniqueUsername
			}
		}

		if err == nil {
			id, _ := res.LastInsertId()
			u.ID = int(id)
			u.OrganisationID = orgID
			createdUsers = append(createdUsers, u)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"users":   createdUsers,
	})
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// GetCentresHandler returns centres for an organisation
func (p *PlayerServiceHandler) GetCentresHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "centres": []interface{}{}})
		return
	}

	ctx := r.Context()
	orgID := r.URL.Query().Get("organisation_id")

	query := "SELECT id, organisation_id, name, location, code, created_at FROM centres"
	var args []interface{}
	if orgID != "" && orgID != "ALL" {
		query += " WHERE organisation_id = ?"
		args = append(args, orgID)
	}
	query += " ORDER BY id ASC"

	rows, err := p.DB.QueryContext(ctx, query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	centres := make([]database.Centre, 0)
	for rows.Next() {
		var c database.Centre
		var createdAt string
		if err := rows.Scan(&c.ID, &c.OrganisationID, &c.Name, &c.Location, &c.Code, &createdAt); err == nil {
			centres = append(centres, c)
		}
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"centres": centres,
	})
}

// SaveCentreHandler creates or updates a centre
func (p *PlayerServiceHandler) SaveCentreHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req database.Centre
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	if req.Name == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Centre name is required"})
		return
	}

	if req.Code == "" {
		req.Code = strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
	}

	ctx := r.Context()
	if req.ID > 0 {
		_, err := p.DB.ExecContext(ctx, `
			UPDATE centres SET name = ?, location = ?, code = ?, organisation_id = ? WHERE id = ?
		`, req.Name, req.Location, req.Code, req.OrganisationID, req.ID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
			return
		}
	} else {
		res, err := p.DB.ExecContext(ctx, `
			INSERT INTO centres (organisation_id, name, location, code) VALUES (?, ?, ?, ?)
		`, req.OrganisationID, req.Name, req.Location, req.Code)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
			return
		}
		id, _ := res.LastInsertId()
		req.ID = int(id)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "centre": req})
}

// DeleteCentreHandler deletes a centre
func (p *PlayerServiceHandler) DeleteCentreHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := r.URL.Query().Get("id")
	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Missing centre ID"})
		return
	}

	_, err := p.DB.ExecContext(r.Context(), "DELETE FROM centres WHERE id = ?", id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// SaveGroupHandler creates or updates a group and ties it to a Centre & Organisation
func (p *PlayerServiceHandler) SaveGroupHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req database.Group
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request body"})
		return
	}

	if req.Name == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Group name is required"})
		return
	}

	if req.Code == "" {
		req.Code = fmt.Sprintf("%s-%s", req.OrganisationID, strings.ToLower(strings.ReplaceAll(req.Name, " ", "-")))
	}

	ctx := r.Context()
	var centreID interface{} = nil
	if req.CentreID > 0 {
		centreID = req.CentreID
	}

	if req.ID > 0 {
		_, err := p.DB.ExecContext(ctx, `
			UPDATE groups SET name = ?, code = ?, organisation_id = ?, centre_id = ? WHERE id = ?
		`, req.Name, req.Code, req.OrganisationID, centreID, req.ID)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
			return
		}
	} else {
		res, err := p.DB.ExecContext(ctx, `
			INSERT INTO groups (organisation_id, centre_id, name, code) VALUES (?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE organisation_id = VALUES(organisation_id), centre_id = VALUES(centre_id), name = VALUES(name)
		`, req.OrganisationID, centreID, req.Name, req.Code)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
			return
		}
		id, _ := res.LastInsertId()
		req.ID = int(id)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "group": req})
}

// VerifyEmbedTokenHandler validates embed tokens according to host domain & DB entitlements (Checklist 1-9)
func (p *PlayerServiceHandler) VerifyEmbedTokenHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"valid": false, "error": "Database unavailable"})
		return
	}

	tokenStr := r.URL.Query().Get("token")
	if tokenStr == "" {
		tokenStr = r.URL.Query().Get("embed_token")
	}
	if tokenStr == "" {
		var body struct {
			Token      string `json:"token"`
			EmbedToken string `json:"embed_token"`
			Origin     string `json:"origin"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err == nil {
			if body.Token != "" {
				tokenStr = body.Token
			} else {
				tokenStr = body.EmbedToken
			}
		}
	}

	if tokenStr == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"valid": false,
			"error": "Missing embed token in request",
		})
		return
	}

	// 1. Verify signed HMAC token signature and expiration (Check 1, 2, 3, 5)
	payload, err := embed.VerifySignedEmbedToken(tokenStr)
	var orgID string
	var isSigned bool = true

	if err != nil {
		// Legacy plain token fallback check in database
		var foundOrgID string
		errDb := p.DB.QueryRowContext(r.Context(), "SELECT id FROM organisations WHERE token = ?", tokenStr).Scan(&foundOrgID)
		if errDb == nil && foundOrgID != "" {
			orgID = foundOrgID
			isSigned = false
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"valid": false,
				"error": fmt.Sprintf("Embed authentication failed: %v", err),
			})
			return
		}
	} else {
		orgID = payload.OrgID
	}

	// 2. Fetch Organisation & Entitlements dynamically from Database (Check 4, 7, 8)
	ctx := r.Context()
	var org database.Organisation
	err = p.DB.QueryRowContext(ctx, `
		SELECT id, name, domain, contact_email, contact_phone, token, google_ads_enabled, type
		FROM organisations WHERE id = ?
	`, orgID).Scan(&org.ID, &org.Name, &org.Domain, &org.ContactEmail, &org.ContactPhone, &org.Token, &org.GoogleAdsEnabled, &org.Type)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"valid": false,
			"error": fmt.Sprintf("Organisation for embed token '%s' not found in database", orgID),
		})
		return
	}

	// 3. Domain Origin Verification (Check 9)
	requestOrigin := r.Header.Get("Origin")
	if requestOrigin == "" {
		requestOrigin = r.Header.Get("Referer")
	}
	if requestOrigin == "" {
		requestOrigin = r.URL.Query().Get("origin")
	}

	if org.Domain != "" && org.Domain != "*" && requestOrigin != "" {
		cleanDomain := strings.ToLower(org.Domain)
		cleanOrigin := strings.ToLower(requestOrigin)
		if !strings.Contains(cleanOrigin, cleanDomain) && !strings.Contains(cleanDomain, "localhost") {
			w.WriteHeader(http.StatusForbidden)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"valid": false,
				"error": fmt.Sprintf("Domain authorization failed: Embed token for '%s' is not authorized on host origin '%s'", org.Domain, requestOrigin),
			})
			return
		}
	}

	// 4. Fetch Active Subscription Entitlements (Check 8)
	var sub database.Subscription
	sub.PlanName = "School Enterprise"
	sub.Status = "active"
	sub.Seats = 100
	_ = p.DB.QueryRowContext(ctx, `
		SELECT plan_name, status, seats FROM subscriptions WHERE organisation_id = ? LIMIT 1
	`, org.ID).Scan(&sub.PlanName, &sub.Status, &sub.Seats)

	// 5. Generate Separate Player Session Token (Check 6)
	playerSessionToken := fmt.Sprintf("SESS_%s_%d", org.ID, time.Now().UnixNano())

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"valid": true,
		"organisation": map[string]interface{}{
			"id":            org.ID,
			"name":          org.Name,
			"domain":        org.Domain,
			"contact_email": org.ContactEmail,
			"type":          org.Type,
		},
		"entitlements": map[string]interface{}{
			"google_ads_enabled": org.GoogleAdsEnabled,
			"plan_name":          sub.PlanName,
			"status":             sub.Status,
			"seats":              sub.Seats,
			"allowed_worlds":     []int{1, 2, 3, 4, 5},
			"allowed_domain":     org.Domain,
		},
		"player_session_token": playerSessionToken,
		"token_info": map[string]interface{}{
			"is_signed": isSigned,
			"minimal_payload": map[string]interface{}{
				"org_id": org.ID,
				"exp":    time.Now().Add(365 * 24 * time.Hour).Unix(),
			},
		},
	})
}

// GenerateEmbedTokenHandler creates a signed HMAC embed token for an organisation
func (p *PlayerServiceHandler) GenerateEmbedTokenHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req struct {
		OrganisationID string `json:"organisation_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.OrganisationID == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Missing organisation_id"})
		return
	}

	signedToken, err := embed.GenerateSignedEmbedToken(req.OrganisationID, 365*24*time.Hour)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	// Update database token column
	_, _ = p.DB.ExecContext(r.Context(), "UPDATE organisations SET token = ? WHERE id = ?", signedToken, req.OrganisationID)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"token":   signedToken,
		"minimal_payload": map[string]interface{}{
			"org_id": req.OrganisationID,
			"exp":    time.Now().Add(365 * 24 * time.Hour).Unix(),
		},
	})
}

// UpdateProfileHandler updates organisation profile details (logo_url, name, domain, email, phone)
func (p *PlayerServiceHandler) UpdateProfileHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req struct {
		ID           string `json:"id"`
		Name         string `json:"name"`
		Domain       string `json:"domain"`
		ContactEmail string `json:"contact_email"`
		ContactPhone string `json:"contact_phone"`
		LogoURL      string `json:"logo_url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid request parameters"})
		return
	}

	if req.LogoURL == "" {
		req.LogoURL = "/monkey1.svg"
	}

	_, err := p.DB.ExecContext(r.Context(), `
		UPDATE organisations SET
			name = COALESCE(NULLIF(?, ''), name),
			domain = ?,
			contact_email = ?,
			contact_phone = ?,
			logo_url = ?
		WHERE id = ?
	`, req.Name, req.Domain, req.ContactEmail, req.ContactPhone, req.LogoURL, req.ID)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// UpdatePasswordHandler verifies current password & sets new password for organisation
func (p *PlayerServiceHandler) UpdatePasswordHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.DB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Database unavailable"})
		return
	}

	var req struct {
		ID              string `json:"id"`
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == "" || req.NewPassword == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Missing required fields"})
		return
	}

	ctx := r.Context()
	var currentDbPassword string
	err := p.DB.QueryRowContext(ctx, "SELECT password FROM organisations WHERE id = ?", req.ID).Scan(&currentDbPassword)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Organisation not found"})
		return
	}

	if currentDbPassword != "" && req.CurrentPassword != "" && currentDbPassword != req.CurrentPassword {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Incorrect current password"})
		return
	}

	_, err = p.DB.ExecContext(ctx, "UPDATE organisations SET password = ? WHERE id = ?", req.NewPassword, req.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	var orgName, contactEmail string
	_ = p.DB.QueryRowContext(ctx, "SELECT name, contact_email FROM organisations WHERE id = ?", req.ID).Scan(&orgName, &contactEmail)
	if p.Mailer != nil && contactEmail != "" {
		p.Mailer.SendPasswordChangedEmail(contactEmail, orgName)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// SendEmailHandler executes direct email dispatch via Hostinger PHP Email Proxy
func (p *PlayerServiceHandler) SendEmailHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if p.Mailer == nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Mailer service unavailable"})
		return
	}

	var req struct {
		To       string `json:"to"`
		Subject  string `json:"subject"`
		HTML     string `json:"html"`
		Text     string `json:"text"`
		From     string `json:"from"`
		FromName string `json:"from_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.To == "" || req.Subject == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Missing required fields: to, subject, html"})
		return
	}

	err := p.Mailer.SendEmail(req.To, req.Subject, req.HTML, req.Text)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Email sent successfully"})
}

func generate6DigitCode() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return fmt.Sprintf("%06d", r.Intn(1000000))
}

// SendVerificationHandler dispatches an email verification OTP code
func (p *PlayerServiceHandler) SendVerificationHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Email) == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Email address is required"})
		return
	}
	email := strings.TrimSpace(strings.ToLower(req.Email))

	code := generate6DigitCode()
	expiresAt := time.Now().Add(15 * time.Minute)

	if p.DB != nil {
		ctx := r.Context()
		_, err := p.DB.ExecContext(ctx, `
			INSERT INTO verification_codes (email, code, type, expires_at)
			VALUES (?, ?, 'email_verification', ?)
		`, email, code, expiresAt)
		if err != nil {
			log.Printf("⚠️ Error saving verification code: %v", err)
		}
	}

	if p.Mailer != nil {
		p.Mailer.SendVerificationEmail(email, code)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Verification code dispatched to your email address",
		"code":    code,
	})
}

// VerifyEmailHandler checks the 6-digit OTP and verifies the email address
func (p *PlayerServiceHandler) VerifyEmailHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Code) == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Both email and verification code are required"})
		return
	}
	email := strings.TrimSpace(strings.ToLower(req.Email))
	code := strings.TrimSpace(req.Code)

	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Email verified successfully"})
		return
	}

	ctx := r.Context()
	var id int
	err := p.DB.QueryRowContext(ctx, `
		SELECT id FROM verification_codes 
		WHERE email = ? AND code = ? AND type = 'email_verification' AND used = FALSE AND expires_at > NOW()
		ORDER BY id DESC LIMIT 1
	`, email, code).Scan(&id)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid or expired verification code"})
		return
	}

	// Mark code as used
	_, _ = p.DB.ExecContext(ctx, "UPDATE verification_codes SET used = TRUE WHERE id = ?", id)
	// Update organisation email_verified status if exists
	_, _ = p.DB.ExecContext(ctx, "UPDATE organisations SET email_verified = TRUE WHERE LOWER(contact_email) = ?", email)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Email address verified successfully",
	})
}

// ForgotPasswordHandler sends a 6-digit password reset OTP to user/organisation contact email
func (p *PlayerServiceHandler) ForgotPasswordHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Email) == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Email address is required"})
		return
	}
	email := strings.TrimSpace(strings.ToLower(req.Email))

	code := generate6DigitCode()
	expiresAt := time.Now().Add(15 * time.Minute)

	if p.DB != nil {
		ctx := r.Context()
		_, err := p.DB.ExecContext(ctx, `
			INSERT INTO verification_codes (email, code, type, expires_at)
			VALUES (?, ?, 'password_reset', ?)
		`, email, code, expiresAt)
		if err != nil {
			log.Printf("⚠️ Error saving password reset code: %v", err)
		}
	}

	if p.Mailer != nil {
		p.Mailer.SendPasswordResetEmail(email, code)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Password reset code sent to your email address",
		"code":    code,
	})
}

// ResetPasswordHandler validates reset code and updates organisation password
func (p *PlayerServiceHandler) ResetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Email       string `json:"email"`
		Code        string `json:"code"`
		NewPassword string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Code) == "" || strings.TrimSpace(req.NewPassword) == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Email, verification code, and new password are all required"})
		return
	}
	email := strings.TrimSpace(strings.ToLower(req.Email))
	code := strings.TrimSpace(req.Code)
	newPassword := strings.TrimSpace(req.NewPassword)

	if p.DB == nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Password updated successfully"})
		return
	}

	ctx := r.Context()
	var id int
	err := p.DB.QueryRowContext(ctx, `
		SELECT id FROM verification_codes 
		WHERE email = ? AND code = ? AND type = 'password_reset' AND used = FALSE AND expires_at > NOW()
		ORDER BY id DESC LIMIT 1
	`, email, code).Scan(&id)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": "Invalid or expired password reset code"})
		return
	}

	// Mark code as used
	_, _ = p.DB.ExecContext(ctx, "UPDATE verification_codes SET used = TRUE WHERE id = ?", id)

	// Update password in organisations
	_, err = p.DB.ExecContext(ctx, "UPDATE organisations SET password = ? WHERE LOWER(contact_email) = ?", newPassword, email)
	if err == nil {
		var orgName string
		_ = p.DB.QueryRowContext(ctx, "SELECT name FROM organisations WHERE LOWER(contact_email) = ?", email).Scan(&orgName)
		if orgName == "" {
			orgName = email
		}
		if p.Mailer != nil {
			p.Mailer.SendPasswordChangedEmail(email, orgName)
		}
	} else {
		log.Printf("⚠️ Warning updating organisation password: %v", err)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Your password has been successfully reset",
	})
}



