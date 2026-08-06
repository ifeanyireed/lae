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
	if _, err := db.ExecContext(ctx, createUserProgressTable); err != nil {
		log.Printf("Warning: User Progress table creation error: %v", err)
	}

	log.Println("✅ Database schema & engine tables (groups, users, progress) initialized successfully.")
	return nil
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
		{1, "Power Up!", "Learn that a robot only acts when given instructions.", "Basic movement (Move Forward)", []string{"move_forward"}, 5},
		{2, "First Steps", "Create a longer sequence of instructions.", "Sequential execution", []string{"move_forward"}, 8},
		{3, "Around the Tree", "Navigate around an obstacle.", "Turning (Left/Right)", []string{"move_forward", "turn_left", "turn_right"}, 10},
		{4, "Energy Crystal", "Collect your first item before reaching the goal.", "Collectibles", []string{"move_forward", "turn_left", "turn_right"}, 10},
		{5, "Treasure Trail", "Collect every energy crystal on the path.", "Planning and multiple collectibles", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 12},
		{6, "Danger Ahead", "Reach the finish without touching dangerous tiles.", "Hazard avoidance", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 12},
		{7, "Watch Your Step!", "Find a safe route around a pit.", "Hazards and alternative paths", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 12},
		{8, "Hidden Rewards", "Explore to collect optional stars before finishing.", "Exploration and bonus objectives", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 15},
		{9, "Treasure Hunt", "Collect all treasures and return safely to the finish.", "Exploration and route planning", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 15},
		{10, "Choose Wisely", "Find the safest and smartest path through the maze.", "Decision making and optimization", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 15},
		{11, "Explorer's Trial", "Combine everything you've learned to solve a complex maze.", "Integrated sequencing, planning, and hazard avoidance", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 20},
		{12, "Journey Home", "Guide the robot through its final mission and help it return home.", "Mastery challenge (all mechanics combined)", []string{"move_forward", "turn_left", "turn_right", "repeat"}, 25},
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

	for _, l := range levelsData {
		svgPath := fmt.Sprintf("/The Lost Monkey Explorer - Level %d.svg", l.Number)
		blocksJSON, _ := json.Marshal(l.Blocks)

		var wps []LevelWaypoint
		if l.Number == 1 {
			wps = level1Waypoints
		} else if l.Number == 2 {
			wps = level2Waypoints
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
