package database

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type World struct {
	ID          int         `json:"id"`
	Slug        string      `json:"slug"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Adventures  []Adventure `json:"adventures,omitempty"`
}

type Adventure struct {
	ID                int     `json:"id"`
	WorldID           int     `json:"world_id"`
	Slug              string  `json:"slug"`
	Title             string  `json:"title"`
	Concept           string  `json:"concept"`
	Icon              string  `json:"icon"`
	Story             string  `json:"story"`
	LearningObjective string  `json:"learning_objective"`
	TotalLevels       int     `json:"total_levels"`
	Levels            []Level `json:"levels,omitempty"`
}

type LevelWaypoint struct {
	ID             int     `json:"id,omitempty"`
	LevelID        int     `json:"level_id,omitempty"`
	WaypointIndex  int     `json:"index"`
	XPercent       float64 `json:"xPercent"`
	YPercent       float64 `json:"yPercent"`
	Type           string  `json:"type"`
	Label          string  `json:"label,omitempty"`
	Effect         string  `json:"effect,omitempty"`
	InitialHeading string  `json:"initialHeading,omitempty"`
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

// InitGameEngineSchema creates game_engine microservice tables
func (db *DB) InitGameEngineSchema() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	createWorldsTable := `
	CREATE TABLE IF NOT EXISTS worlds (
		id INT AUTO_INCREMENT PRIMARY KEY,
		slug VARCHAR(100) UNIQUE NOT NULL,
		name VARCHAR(255) NOT NULL,
		description TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createAdventuresTable := `
	CREATE TABLE IF NOT EXISTS adventures (
		id INT AUTO_INCREMENT PRIMARY KEY,
		world_id INT DEFAULT 1,
		slug VARCHAR(100) UNIQUE NOT NULL,
		title VARCHAR(255) NOT NULL,
		concept VARCHAR(100) DEFAULT 'Sequencing',
		icon VARCHAR(50) DEFAULT '🐵',
		story TEXT,
		learning_objective TEXT,
		total_levels INT DEFAULT 12,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (world_id) REFERENCES worlds(id) ON DELETE CASCADE
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

	if _, err := db.ExecContext(ctx, createWorldsTable); err != nil {
		return err
	}
	if _, err := db.ExecContext(ctx, createAdventuresTable); err != nil {
		return err
	}
	_, _ = db.ExecContext(ctx, "ALTER TABLE adventures ADD COLUMN world_id INT DEFAULT 1;")
	_, _ = db.ExecContext(ctx, "ALTER TABLE adventures ADD COLUMN concept VARCHAR(100) DEFAULT 'Sequencing';")
	_, _ = db.ExecContext(ctx, "ALTER TABLE adventures ADD COLUMN icon VARCHAR(50) DEFAULT '🐵';")

	if _, err := db.ExecContext(ctx, createLevelsTable); err != nil {
		return err
	}
	_, _ = db.ExecContext(ctx, "ALTER TABLE levels ADD COLUMN waypoints JSON;")

	if _, err := db.ExecContext(ctx, createWaypointsTable); err != nil {
		return err
	}

	log.Println("✅ [game_engine] Tables (worlds, adventures, levels, level_waypoints) initialized.")
	return nil
}

// SeedWorldsAndAdventures populates 5 Worlds & 5 Adventures into game_engine tables
func (db *DB) SeedWorldsAndAdventures() error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	worlds := []struct {
		ID          int
		Slug        string
		Name        string
		Description string
	}{
		{1, "world-1", "World 1 — Monkey Explorers", "Master Sequencing, Loops, Conditionals, Variables, and Functions."},
		{2, "world-2", "World 2 — HTML Kingdom", "Build web pages using DOCTYPE, HTML, HEAD, TITLE, BODY, H1, P, LIST, LINK, and IMAGE tags."},
		{3, "world-3", "World 3 — Enchanted Wilderness", "Make smart decisions using If / Else logic."},
		{4, "world-4", "World 4 — Island Archipelago", "Store and update resources with variables."},
		{5, "world-5", "World 5 — Inventors Hub", "Create reusable groups of instructions with functions."},
	}

	for _, w := range worlds {
		_, _ = db.ExecContext(ctx, `
			INSERT INTO worlds (id, slug, name, description)
			VALUES (?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)
		`, w.ID, w.Slug, w.Name, w.Description)
	}

	adventures := []struct {
		ID                int
		WorldID           int
		Slug              string
		Title             string
		Concept           string
		Icon              string
		Story             string
		LearningObjective string
	}{
		// World 1 Adventures (1-5)
		{1, 1, "the-lost-monkey-explorer", "The Lost Monkey Explorer", "Sequencing", "🐵", "A friendly little monkey has crash-landed in the Whispering Forest. Its navigation system is broken, and only by giving it the correct instructions can it find its way home.", "Follow and create simple sequences."},
		{2, 1, "the-crystal-cave", "The Crystal Cave", "Loops", "💎", "The Monkey enters a magical cave filled with glowing crystals. Many paths repeat, and doing the same action over and over is too slow. The Monkey discovers the power of Repeat.", "Repeat instructions efficiently."},
		{3, 1, "the-enchanted-jungle", "The Enchanted Jungle", "Conditionals", "🌿", "The jungle is alive. Bridges appear and disappear, gates open with keys, and animals react differently depending on what the Monkey finds. The Monkey must learn to make decisions.", "Make decisions based on situations."},
		{4, 1, "monkeys-treasure-island", "Monkey's Treasure Island", "Variables", "🏝️", "The Monkey lands on an island where bananas, coins, gems, and hearts are collected and counted. Progress depends on keeping track of resources.", "Store and update information."},
		{5, 1, "the-monkey-inventors-workshop", "The Monkey Inventor's Workshop", "Functions", "⚙️", "The Monkey becomes an inventor. Instead of repeating long instruction sequences, it creates reusable Monkey Moves that can be used again and again.", "Reuse groups of instructions."},

		// World 2 HTML Adventures (6-10)
		{6, 2, "html-architect", "The HTML Architect", "HTML Skeleton", "📜", "Enter the Web Kingdom! Learn how DOCTYPE, HTML, HEAD, TITLE, and BODY form the foundation of every web page.", "Understand HTML page structure."},
		{7, 2, "headings-and-paragraphs", "Headings & Paragraphs", "Text Elements", "📝", "Bring stories to life on the web using H1 headers and P paragraph text blocks.", "Use HTML text tags."},
		{8, 2, "lists-and-hyperlinks", "Lists & Hyperlinks", "Navigation", "🔗", "Connect web pages together using LINK and organize content using LIST blocks.", "Create lists and hyperlinks."},
		{9, 2, "media-and-images", "Media & Images", "Visual Media", "🖼️", "Style your website with vibrant visual content using IMAGE blocks.", "Embed images in HTML."},
		{10, 2, "master-web-developer", "Master Web Developer", "Web Design", "🌍", "Combine all HTML blocks (DOCTYPE, HTML, HEAD, TITLE, BODY, H1, P, LIST, LINK, IMAGE) to build complete web applications!", "Master full HTML page design."},
	}

	for _, a := range adventures {
		_, _ = db.ExecContext(ctx, `
			INSERT INTO adventures (id, world_id, slug, title, concept, icon, story, learning_objective, total_levels)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, 12)
			ON DUPLICATE KEY UPDATE world_id=VALUES(world_id), title=VALUES(title), concept=VALUES(concept), icon=VALUES(icon), story=VALUES(story)
		`, a.ID, a.WorldID, a.Slug, a.Title, a.Concept, a.Icon, a.Story, a.LearningObjective)
	}

	level1Waypoints := []LevelWaypoint{
		{WaypointIndex: 0, XPercent: 50.16, YPercent: 37.6, Type: "start", Label: "START", InitialHeading: "S"},
		{WaypointIndex: 1, XPercent: 50.16, YPercent: 46.0, Type: "normal"},
		{WaypointIndex: 2, XPercent: 50.16, YPercent: 54.5, Type: "normal"},
		{WaypointIndex: 3, XPercent: 50.16, YPercent: 63.0, Type: "goal", Label: "FINISH"},
	}

	for _, a := range adventures {
		for lvlNum := 1; lvlNum <= 12; lvlNum++ {
			title := fmt.Sprintf("Mission %d", lvlNum)
			if a.ID == 1 {
				titles := []string{"Power Up!", "First Steps", "Around the Tree", "Energy Crystal", "Treasure Trail", "Danger Ahead", "Watch Your Step!", "Hidden Rewards", "Treasure Hunt", "Choose Wisely", "Explorer's Trial", "Journey Home"}
				title = titles[lvlNum-1]
			}

			var advBlocks []string
			switch a.ID {
			// World 1 Blocks
			case 1:
				if lvlNum <= 2 {
					advBlocks = []string{"move_forward"}
				} else {
					advBlocks = []string{"move_forward", "turn_left", "turn_right", "turn_around"}
				}
			case 2:
				advBlocks = []string{"move_forward", "turn_left", "turn_right", "turn_around", "repeat"}
			case 3:
				advBlocks = []string{"move_forward", "turn_left", "turn_right", "turn_around", "repeat", "if_path"}
			case 4:
				advBlocks = []string{"move_forward", "turn_left", "turn_right", "turn_around", "repeat", "set_var"}
			case 5:
				advBlocks = []string{"move_forward", "turn_left", "turn_right", "turn_around", "repeat", "my_function"}

			// World 2 HTML Blocks
			case 6:
				advBlocks = []string{"doctype", "html_tag", "head_tag", "title_tag", "body_tag"}
			case 7:
				advBlocks = []string{"doctype", "html_tag", "body_tag", "h1_tag", "p_tag"}
			case 8:
				advBlocks = []string{"doctype", "html_tag", "body_tag", "list_tag", "link_tag"}
			case 9:
				advBlocks = []string{"doctype", "html_tag", "body_tag", "img_tag"}
			case 10:
				advBlocks = []string{"doctype", "html_tag", "head_tag", "title_tag", "body_tag", "h1_tag", "p_tag", "list_tag", "link_tag", "img_tag"}

			default:
				advBlocks = []string{"move_forward", "turn_left", "turn_right", "turn_around"}
			}

			svgPath := fmt.Sprintf("/The Lost Monkey Explorer - Level %d.svg", lvlNum)
			blocksJSON, _ := json.Marshal(advBlocks)
			wpsJSON, _ := json.Marshal(level1Waypoints)

			_, _ = db.ExecContext(ctx, `
				INSERT INTO levels (adventure_id, level_number, title, objective, mechanic, svg_map, max_blocks, available_blocks, waypoints)
				VALUES (?, ?, ?, 'Complete mission goal.', 'Sequential Execution', ?, 15, ?, ?)
				ON DUPLICATE KEY UPDATE title=VALUES(title), svg_map=VALUES(svg_map), max_blocks=VALUES(max_blocks), available_blocks=VALUES(available_blocks)
			`, a.ID, lvlNum, title, svgPath, string(blocksJSON), string(wpsJSON))
		}
	}

	log.Println("🌱 [game_engine] Seeded 5 Worlds, 5 Adventures, and 60 Levels into DB.")
	return nil
}

// SaveLevelWaypoints updates waypoints JSON in game_engine levels table
func (db *DB) SaveLevelWaypoints(ctx context.Context, adventureID int, levelNumber int, waypoints []LevelWaypoint) error {
	waypointsJSON, err := json.Marshal(waypoints)
	if err != nil {
		return fmt.Errorf("failed to marshal waypoints: %w", err)
	}

	if adventureID <= 0 {
		adventureID = 1
	}

	res, err := db.ExecContext(ctx, "UPDATE levels SET waypoints = ? WHERE adventure_id = ? AND level_number = ?", string(waypointsJSON), adventureID, levelNumber)
	if err != nil {
		return fmt.Errorf("failed to update levels waypoints: %w", err)
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		_, _ = db.ExecContext(ctx, "UPDATE levels SET waypoints = ? WHERE level_number = ?", string(waypointsJSON), levelNumber)
	}

	var levelID int
	err = db.QueryRowContext(ctx, "SELECT id FROM levels WHERE adventure_id = ? AND level_number = ?", adventureID, levelNumber).Scan(&levelID)
	if err != nil {
		_ = db.QueryRowContext(ctx, "SELECT id FROM levels WHERE level_number = ? LIMIT 1", levelNumber).Scan(&levelID)
	}

	if levelID > 0 {
		_, _ = db.ExecContext(ctx, "DELETE FROM level_waypoints WHERE level_id = ?", levelID)
		for _, wp := range waypoints {
			_, _ = db.ExecContext(ctx, `
				INSERT INTO level_waypoints (level_id, waypoint_index, x_percent, y_percent, type, label, effect)
				VALUES (?, ?, ?, ?, ?, ?, ?)
			`, levelID, wp.WaypointIndex, wp.XPercent, wp.YPercent, wp.Type, wp.Label, wp.Effect)
		}
	}

	return nil
}
