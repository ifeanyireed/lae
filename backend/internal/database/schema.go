package database

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type Adventure struct {
	ID                int     `json:"id"`
	Slug              string  `json:"slug"`
	Title             string  `json:"title"`
	Story             string  `json:"story"`
	LearningObjective string  `json:"learning_objective"`
	TotalLevels       int     `json:"total_levels"`
	Levels            []Level `json:"levels,omitempty"`
}

type LevelWaypoint struct {
	ID            int     `json:"id,omitempty"`
	LevelID       int     `json:"level_id,omitempty"`
	WaypointIndex int     `json:"index"`
	XPercent      float64 `json:"xPercent"`
	YPercent      float64 `json:"yPercent"`
	Type          string  `json:"type"`
	Label         string  `json:"label,omitempty"`
	Effect        string  `json:"effect,omitempty"`
}

type Level struct {
	ID              int             `json:"id"`
	AdventureID     int             `json:"adventure_id"`
	LevelNumber     int             `json:"level_number"`
	Title           string          `json:"title"`
	Objective       string          `json:"objective"`
	Mechanic        string          `json:"mechanic"`
	SVGMap          string          `json:"svg_map"`
	MaxBlocks       int             `json:"max_blocks"`
	AvailableBlocks []string        `json:"available_blocks"`
	Waypoints       []LevelWaypoint `json:"waypoints,omitempty"`
}

type Group struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Code      string    `json:"code"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

type User struct {
	ID         int       `json:"id"`
	Username   string    `json:"username"`
	AccessCode string    `json:"access_code,omitempty"`
	Role       string    `json:"role"` // "admin" or "user"
	GroupID    int       `json:"group_id"`
	GroupName  string    `json:"group_name,omitempty"`
	Avatar     string    `json:"avatar"`
	TotalXP    int       `json:"total_xp"`
	TotalStars int       `json:"total_stars"`
	CreatedAt  time.Time `json:"created_at,omitempty"`
}

type UserProgress struct {
	ID          int       `json:"id,omitempty"`
	UserID      int       `json:"user_id"`
	LevelNumber int       `json:"level_number"`
	Stars       int       `json:"stars"`
	Score       int       `json:"score"`
	Completed   bool      `json:"completed"`
	UpdatedAt   time.Time `json:"updated_at,omitempty"`
}

// InitSchema creates the required database tables if they do not exist
func (db *DB) InitSchema() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	createAdventuresTable := `
	CREATE TABLE IF NOT EXISTS adventures (
		id INT AUTO_INCREMENT PRIMARY KEY,
		slug VARCHAR(100) UNIQUE NOT NULL,
		title VARCHAR(255) NOT NULL,
		story TEXT,
		learning_objective TEXT,
		total_levels INT DEFAULT 12,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createLevelsTable := `
	CREATE TABLE IF NOT EXISTS levels (
		id INT AUTO_INCREMENT PRIMARY KEY,
		adventure_id INT NOT NULL,
		level_number INT NOT NULL,
		title VARCHAR(255) NOT NULL,
		objective TEXT,
		mechanic VARCHAR(255),
		svg_map VARCHAR(255),
		max_blocks INT DEFAULT 10,
		available_blocks JSON,
		waypoints JSON,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE KEY unique_adv_lvl (adventure_id, level_number),
		FOREIGN KEY (adventure_id) REFERENCES adventures(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createWaypointsTable := `
	CREATE TABLE IF NOT EXISTS level_waypoints (
		id INT AUTO_INCREMENT PRIMARY KEY,
		level_id INT NOT NULL,
		waypoint_index INT NOT NULL,
		x_percent FLOAT NOT NULL,
		y_percent FLOAT NOT NULL,
		type VARCHAR(50) DEFAULT 'normal',
		label VARCHAR(100),
		effect VARCHAR(50),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE KEY unique_lvl_wp (level_id, waypoint_index),
		FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createGroupsTable := `
	CREATE TABLE IF NOT EXISTS groups (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		code VARCHAR(100) UNIQUE NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(100) UNIQUE NOT NULL,
		access_code VARCHAR(50) UNIQUE DEFAULT NULL,
		role VARCHAR(50) DEFAULT 'user',
		group_id INT DEFAULT 1,
		avatar VARCHAR(255) DEFAULT '/monkey1.svg',
		total_xp INT DEFAULT 0,
		total_stars INT DEFAULT 0,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createUserProgressTable := `
	CREATE TABLE IF NOT EXISTS user_progress (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id INT NOT NULL,
		level_number INT NOT NULL,
		stars INT DEFAULT 0,
		score INT DEFAULT 0,
		completed BOOLEAN DEFAULT FALSE,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		UNIQUE KEY unique_user_lvl (user_id, level_number),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	if _, err := db.ExecContext(ctx, createAdventuresTable); err != nil {
		return err
	}
	if _, err := db.ExecContext(ctx, createLevelsTable); err != nil {
		return err
	}
	// Try adding waypoints column if table already existed without it
	_, _ = db.ExecContext(ctx, "ALTER TABLE levels ADD COLUMN waypoints JSON;")

	if _, err := db.ExecContext(ctx, createWaypointsTable); err != nil {
		return err
	}
	if _, err := db.ExecContext(ctx, createGroupsTable); err != nil {
		log.Printf("Warning: Groups table creation error: %v", err)
	}
	if _, err := db.ExecContext(ctx, createUsersTable); err != nil {
		log.Printf("Warning: Users table creation error: %v", err)
	}
	_, _ = db.ExecContext(ctx, "ALTER TABLE users ADD COLUMN access_code VARCHAR(50) UNIQUE DEFAULT NULL;")

	if _, err := db.ExecContext(ctx, createUserProgressTable); err != nil {
		log.Printf("Warning: User Progress table creation error: %v", err)
	}

	// Seed default access code users into database
	db.seedAccessCodeUsers(ctx)

	log.Println("✅ Database schema & engine tables (groups, users, progress) initialized successfully.")
	return nil
}

func (db *DB) seedAccessCodeUsers(ctx context.Context) {
	_, _ = db.ExecContext(ctx, "INSERT IGNORE INTO groups (id, name, code) VALUES (1, 'Jungle Explorers Group A', 'jungle-a')")

	seedUsers := []struct {
		Username   string
		AccessCode string
		Role       string
		Avatar     string
		XP         int
	}{
		{"Admin_Explorer", "ADMN-2026", "admin", "/monkey1.svg", 1500},
		{"Cadet_Leo", "KIDS-1001", "user", "/monkey1.svg", 450},
		{"Cadet_Maya", "KIDS-1002", "user", "/Profile.svg", 300},
		{"Cadet_Sam", "KIDS-1003", "user", "/monkey1.svg", 600},
	}

	for _, u := range seedUsers {
		_, _ = db.ExecContext(ctx, `
			INSERT INTO users (username, access_code, role, group_id, avatar, total_xp, total_stars)
			VALUES (?, ?, ?, 1, ?, ?, 3)
			ON DUPLICATE KEY UPDATE access_code = VALUES(access_code), role = VALUES(role)
		`, u.Username, u.AccessCode, u.Role, u.Avatar, u.XP)
	}
}

// SeedAdventure1 populates Adventure 1 and its 12 levels into the database if not already present
func (db *DB) SeedAdventure1() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var advID int
	err := db.QueryRowContext(ctx, "SELECT id FROM adventures WHERE slug = ?", "the-lost-monkey-explorer").Scan(&advID)
	if err != nil {
		story := `A friendly little robot has crash-landed in the Whispering Forest. Its navigation system is broken, and only by giving it the correct instructions can it find its way home. Every level repairs a little more of the robot's memory and unlocks the path ahead.`
		learningObjective := `Follow and create simple sequences; Understand that instructions execute in order; Navigate using movement commands; Plan a route before execution; Collect required items while completing a task; Recognize and avoid hazards; Debug simple mistakes; Complete increasingly complex algorithmic challenges.`

		res, err := db.ExecContext(ctx,
			"INSERT INTO adventures (slug, title, story, learning_objective, total_levels) VALUES (?, ?, ?, ?, ?)",
			"the-lost-monkey-explorer", "The Lost Monkey Explorer", story, learningObjective, 12,
		)
		if err != nil {
			return err
		}
		id, _ := res.LastInsertId()
		advID = int(id)
		log.Println("🌱 Seeded Adventure 1: The Lost Monkey Explorer into database.")
	}

	levelsData := []struct {
		Number    int
		Title     string
		Objective string
		Mechanic  string
		Blocks    []string
		MaxBlocks int
	}{
		{1, "Power Up!", "Learn that a robot only acts when given instructions.", "Basic Movement", []string{"move_forward"}, 5},
		{2, "First Steps", "Create a longer sequence of instructions.", "Sequential Execution", []string{"move_forward"}, 8},
		{3, "Around the Tree", "Navigate around an obstacle.", "Turning", []string{"move_forward", "turn_left", "turn_right"}, 10},
		{4, "Energy Crystal", "Collect your first item before reaching the goal.", "Collectibles", []string{"move_forward", "turn_left", "turn_right"}, 10},
		{5, "Treasure Trail", "Collect every energy crystal on the path.", "Planning & Collectibles", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 12},
		{6, "Danger Ahead", "Reach the finish without touching dangerous tiles.", "Hazard Avoidance", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 12},
		{7, "Watch Your Step!", "Find a safe route around a pit.", "Alternative Paths", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 12},
		{8, "Hidden Rewards", "Explore to collect optional stars before finishing.", "Bonus Objectives", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 15},
		{9, "Treasure Hunt", "Collect all treasures and return safely to the finish.", "Route Planning", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 15},
		{10, "Choose Wisely", "Find the safest and smartest path through the maze.", "Path Optimization", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 15},
		{11, "Explorer's Trial", "Combine everything you've learned to solve a complex maze.", "Integrated Trial", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 20},
		{12, "Journey Home", "Guide the robot through its final mission and help it return home.", "Mastery Challenge", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 25},
	}

	level1Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 50.16, YPercent: 37.6, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 50.16, YPercent: 46.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 50.16, YPercent: 54.5, Type: "normal"},
		{WaypointIndex: 3, XPercent: 50.16, YPercent: 63.0, Type: "goal", Label: "FINISH"},
	}

	level2Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 49.44, YPercent: 35.7, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 49.44, YPercent: 42.4, Type: "normal"},
		{WaypointIndex: 2, XPercent: 49.44, YPercent: 49.1, Type: "normal"},
		{WaypointIndex: 3, XPercent: 49.44, YPercent: 55.8, Type: "normal"},
		{WaypointIndex: 4, XPercent: 49.44, YPercent: 62.5, Type: "normal"},
		{WaypointIndex: 5, XPercent: 49.44, YPercent: 69.2, Type: "goal", Label: "FINISH"},
	}

	level3Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 50.16, YPercent: 35.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 50.16, YPercent: 44.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 50.16, YPercent: 53.0, Type: "normal"},
		{WaypointIndex: 3, XPercent: 62.0, YPercent: 53.0, Type: "normal"},
		{WaypointIndex: 4, XPercent: 62.0, YPercent: 65.0, Type: "normal"},
		{WaypointIndex: 5, XPercent: 50.16, YPercent: 65.0, Type: "goal", Label: "FINISH"},
	}

	level4Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 48.0, YPercent: 32.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 48.0, YPercent: 41.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 48.0, YPercent: 50.0, Type: "normal"},
		{WaypointIndex: 3, XPercent: 60.0, YPercent: 50.0, Type: "coin", Label: "ENERGY CRYSTAL"},
		{WaypointIndex: 4, XPercent: 60.0, YPercent: 60.0, Type: "normal"},
		{WaypointIndex: 5, XPercent: 60.0, YPercent: 70.0, Type: "goal", Label: "FINISH"},
	}

	level5Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 42.0, YPercent: 30.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 42.0, YPercent: 40.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 52.0, YPercent: 40.0, Type: "coin", Label: "CRYSTAL 1"},
		{WaypointIndex: 3, XPercent: 62.0, YPercent: 40.0, Type: "normal"},
		{WaypointIndex: 4, XPercent: 62.0, YPercent: 52.0, Type: "coin", Label: "CRYSTAL 2"},
		{WaypointIndex: 5, XPercent: 62.0, YPercent: 64.0, Type: "normal"},
		{WaypointIndex: 6, XPercent: 52.0, YPercent: 64.0, Type: "coin", Label: "CRYSTAL 3"},
		{WaypointIndex: 7, XPercent: 42.0, YPercent: 64.0, Type: "goal", Label: "FINISH"},
	}

	level6Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 45.0, YPercent: 28.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 45.0, YPercent: 38.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 55.0, YPercent: 38.0, Type: "shell", Effect: "back_2", Label: "HAZARD PIT"},
		{WaypointIndex: 3, XPercent: 45.0, YPercent: 48.0, Type: "normal"},
		{WaypointIndex: 4, XPercent: 45.0, YPercent: 58.0, Type: "normal"},
		{WaypointIndex: 5, XPercent: 55.0, YPercent: 58.0, Type: "coin", Label: "CRYSTAL"},
		{WaypointIndex: 6, XPercent: 55.0, YPercent: 68.0, Type: "goal", Label: "FINISH"},
	}

	level7Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 38.0, YPercent: 28.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 38.0, YPercent: 40.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 50.0, YPercent: 40.0, Type: "shell", Effect: "back_2", Label: "PIT"},
		{WaypointIndex: 3, XPercent: 38.0, YPercent: 52.0, Type: "normal"},
		{WaypointIndex: 4, XPercent: 50.0, YPercent: 52.0, Type: "star", Effect: "advance_3", Label: "SUPER STAR"},
		{WaypointIndex: 5, XPercent: 62.0, YPercent: 52.0, Type: "normal"},
		{WaypointIndex: 6, XPercent: 62.0, YPercent: 64.0, Type: "coin", Label: "COIN"},
		{WaypointIndex: 7, XPercent: 62.0, YPercent: 76.0, Type: "goal", Label: "FINISH"},
	}

	level8Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 35.0, YPercent: 25.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 35.0, YPercent: 36.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 47.0, YPercent: 36.0, Type: "coin", Label: "COIN"},
		{WaypointIndex: 3, XPercent: 59.0, YPercent: 36.0, Type: "star", Effect: "advance_3", Label: "SUPER STAR"},
		{WaypointIndex: 4, XPercent: 59.0, YPercent: 48.0, Type: "normal"},
		{WaypointIndex: 5, XPercent: 47.0, YPercent: 48.0, Type: "shell", Effect: "back_2", Label: "HAZARD"},
		{WaypointIndex: 6, XPercent: 59.0, YPercent: 60.0, Type: "normal"},
		{WaypointIndex: 7, XPercent: 59.0, YPercent: 72.0, Type: "coin", Label: "COIN"},
		{WaypointIndex: 8, XPercent: 47.0, YPercent: 72.0, Type: "goal", Label: "FINISH"},
	}

	level9Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 32.0, YPercent: 22.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 32.0, YPercent: 34.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 44.0, YPercent: 34.0, Type: "coin", Label: "COIN 1"},
		{WaypointIndex: 3, XPercent: 56.0, YPercent: 34.0, Type: "normal"},
		{WaypointIndex: 4, XPercent: 68.0, YPercent: 34.0, Type: "coin", Label: "COIN 2"},
		{WaypointIndex: 5, XPercent: 68.0, YPercent: 46.0, Type: "normal"},
		{WaypointIndex: 6, XPercent: 68.0, YPercent: 58.0, Type: "star", Effect: "advance_3", Label: "STAR"},
		{WaypointIndex: 7, XPercent: 56.0, YPercent: 58.0, Type: "coin", Label: "COIN 3"},
		{WaypointIndex: 8, XPercent: 44.0, YPercent: 58.0, Type: "normal"},
		{WaypointIndex: 9, XPercent: 44.0, YPercent: 70.0, Type: "goal", Label: "FINISH"},
	}

	level10Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 30.0, YPercent: 20.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 30.0, YPercent: 32.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 42.0, YPercent: 32.0, Type: "shell", Effect: "back_2", Label: "TRAP"},
		{WaypointIndex: 3, XPercent: 30.0, YPercent: 44.0, Type: "coin", Label: "SAFE COIN"},
		{WaypointIndex: 4, XPercent: 42.0, YPercent: 44.0, Type: "normal"},
		{WaypointIndex: 5, XPercent: 54.0, YPercent: 44.0, Type: "star", Effect: "advance_3", Label: "BOOST"},
		{WaypointIndex: 6, XPercent: 66.0, YPercent: 44.0, Type: "normal"},
		{WaypointIndex: 7, XPercent: 66.0, YPercent: 56.0, Type: "coin", Label: "COIN"},
		{WaypointIndex: 8, XPercent: 54.0, YPercent: 56.0, Type: "normal"},
		{WaypointIndex: 9, XPercent: 54.0, YPercent: 68.0, Type: "goal", Label: "FINISH"},
	}

	level11Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 25.0, YPercent: 18.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 25.0, YPercent: 30.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 37.0, YPercent: 30.0, Type: "coin", Label: "COIN 1"},
		{WaypointIndex: 3, XPercent: 49.0, YPercent: 30.0, Type: "normal"},
		{WaypointIndex: 4, XPercent: 61.0, YPercent: 30.0, Type: "shell", Effect: "back_2", Label: "TRAP"},
		{WaypointIndex: 5, XPercent: 73.0, YPercent: 30.0, Type: "star", Effect: "advance_3", Label: "STAR"},
		{WaypointIndex: 6, XPercent: 73.0, YPercent: 44.0, Type: "normal"},
		{WaypointIndex: 7, XPercent: 61.0, YPercent: 44.0, Type: "coin", Label: "COIN 2"},
		{WaypointIndex: 8, XPercent: 49.0, YPercent: 44.0, Type: "normal"},
		{WaypointIndex: 9, XPercent: 49.0, YPercent: 58.0, Type: "coin", Label: "COIN 3"},
		{WaypointIndex: 10, XPercent: 61.0, YPercent: 58.0, Type: "normal"},
		{WaypointIndex: 11, XPercent: 61.0, YPercent: 72.0, Type: "goal", Label: "FINISH"},
	}

	level12Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 20.0, YPercent: 15.0, Type: "start", Label: "START"},
		{WaypointIndex: 1, XPercent: 20.0, YPercent: 27.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 32.0, YPercent: 27.0, Type: "coin", Label: "COIN 1"},
		{WaypointIndex: 3, XPercent: 44.0, YPercent: 27.0, Type: "normal"},
		{WaypointIndex: 4, XPercent: 56.0, YPercent: 27.0, Type: "shell", Effect: "back_2", Label: "HAZARD 1"},
		{WaypointIndex: 5, XPercent: 68.0, YPercent: 27.0, Type: "star", Effect: "advance_3", Label: "SUPER STAR"},
		{WaypointIndex: 6, XPercent: 80.0, YPercent: 27.0, Type: "normal"},
		{WaypointIndex: 7, XPercent: 80.0, YPercent: 42.0, Type: "coin", Label: "COIN 2"},
		{WaypointIndex: 8, XPercent: 68.0, YPercent: 42.0, Type: "normal"},
		{WaypointIndex: 9, XPercent: 56.0, YPercent: 42.0, Type: "shell", Effect: "back_2", Label: "HAZARD 2"},
		{WaypointIndex: 10, XPercent: 44.0, YPercent: 42.0, Type: "coin", Label: "COIN 3"},
		{WaypointIndex: 11, XPercent: 44.0, YPercent: 57.0, Type: "star", Effect: "advance_3", Label: "BOOST"},
		{WaypointIndex: 12, XPercent: 56.0, YPercent: 57.0, Type: "normal"},
		{WaypointIndex: 13, XPercent: 68.0, YPercent: 57.0, Type: "coin", Label: "FINAL COIN"},
		{WaypointIndex: 14, XPercent: 68.0, YPercent: 75.0, Type: "goal", Label: "FINISH"},
	}

	for _, l := range levelsData {
		svgPath := fmt.Sprintf("/The Lost Monkey Explorer - Level %d.svg", l.Number)
		blocksJSON, _ := json.Marshal(l.Blocks)

		var wps []LevelWaypoint
		switch l.Number {
		case 1:
			wps = level1Waypoints
		case 2:
			wps = level2Waypoints
		case 3:
			wps = level3Waypoints
		case 4:
			wps = level4Waypoints
		case 5:
			wps = level5Waypoints
		case 6:
			wps = level6Waypoints
		case 7:
			wps = level7Waypoints
		case 8:
			wps = level8Waypoints
		case 9:
			wps = level9Waypoints
		case 10:
			wps = level10Waypoints
		case 11:
			wps = level11Waypoints
		case 12:
			wps = level12Waypoints
		}

		var waypointsJSON string
		if len(wps) > 0 {
			b, _ := json.Marshal(wps)
			waypointsJSON = string(b)
		}

		if waypointsJSON != "" {
			_, err := db.ExecContext(ctx, `
				INSERT INTO levels (adventure_id, level_number, title, objective, mechanic, svg_map, max_blocks, available_blocks, waypoints)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
				ON DUPLICATE KEY UPDATE title=?, objective=?, mechanic=?, svg_map=?, max_blocks=?, available_blocks=?, waypoints=?
			`, advID, l.Number, l.Title, l.Objective, l.Mechanic, svgPath, l.MaxBlocks, string(blocksJSON), waypointsJSON,
				l.Title, l.Objective, l.Mechanic, svgPath, l.MaxBlocks, string(blocksJSON), waypointsJSON,
			)
			if err != nil {
				log.Printf("Error seeding level %d: %v", l.Number, err)
			}
		} else {
			_, err := db.ExecContext(ctx, `
				INSERT INTO levels (adventure_id, level_number, title, objective, mechanic, svg_map, max_blocks, available_blocks)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				ON DUPLICATE KEY UPDATE title=?, objective=?, mechanic=?, svg_map=?, max_blocks=?, available_blocks=?
			`, advID, l.Number, l.Title, l.Objective, l.Mechanic, svgPath, l.MaxBlocks, string(blocksJSON),
				l.Title, l.Objective, l.Mechanic, svgPath, l.MaxBlocks, string(blocksJSON),
			)
			if err != nil {
				log.Printf("Error seeding level %d: %v", l.Number, err)
			}
		}
	}

	log.Println("🌱 Seeded all 12 Adventure levels into database successfully.")
	return nil
}

// SaveLevelWaypoints updates the waypoints JSON column in levels table and populates level_waypoints table
func (db *DB) SaveLevelWaypoints(ctx context.Context, levelNumber int, waypoints []LevelWaypoint) error {
	waypointsJSON, err := json.Marshal(waypoints)
	if err != nil {
		return fmt.Errorf("failed to marshal waypoints: %w", err)
	}

	// Update levels table waypoints JSON
	_, err = db.ExecContext(ctx, "UPDATE levels SET waypoints = ? WHERE level_number = ?", string(waypointsJSON), levelNumber)
	if err != nil {
		return fmt.Errorf("failed to update levels waypoints: %w", err)
	}

	// Get level ID
	var levelID int
	err = db.QueryRowContext(ctx, "SELECT id FROM levels WHERE level_number = ?", levelNumber).Scan(&levelID)
	if err == nil {
		// Clear existing waypoints for level in level_waypoints table
		_, _ = db.ExecContext(ctx, "DELETE FROM level_waypoints WHERE level_id = ?", levelID)
		// Insert individual waypoints into level_waypoints table
		for _, wp := range waypoints {
			_, _ = db.ExecContext(ctx, `
				INSERT INTO level_waypoints (level_id, waypoint_index, x_percent, y_percent, type, label, effect)
				VALUES (?, ?, ?, ?, ?, ?, ?)
			`, levelID, wp.WaypointIndex, wp.XPercent, wp.YPercent, wp.Type, wp.Label, wp.Effect)
		}
	}

	return nil
}
