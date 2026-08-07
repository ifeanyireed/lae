package database

import (
	"context"
	"log"
	"time"
)

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
	Role       string    `json:"role"`
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
	WorldID     int       `json:"world_id,omitempty"`
	AdventureID int       `json:"adventure_id,omitempty"`
	LevelNumber int       `json:"level_number"`
	Stars       int       `json:"stars"`
	Score       int       `json:"score"`
	Completed   bool      `json:"completed"`
	UpdatedAt   time.Time `json:"updated_at,omitempty"`
}

// InitPlayerServiceSchema creates player_service microservice tables
func (db *DB) InitPlayerServiceSchema() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

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
		world_id INT DEFAULT 1,
		adventure_id INT DEFAULT 1,
		level_number INT NOT NULL,
		stars INT DEFAULT 0,
		score INT DEFAULT 0,
		completed BOOLEAN DEFAULT FALSE,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		UNIQUE KEY unique_user_world_adv_lvl (user_id, world_id, adventure_id, level_number),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

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
	_, _ = db.ExecContext(ctx, "ALTER TABLE user_progress ADD COLUMN world_id INT DEFAULT 1;")
	_, _ = db.ExecContext(ctx, "ALTER TABLE user_progress ADD COLUMN adventure_id INT DEFAULT 1;")

	db.seedAccessCodeUsers(ctx)

	log.Println("✅ [player_service] Microservice tables (groups, users, user_progress) initialized.")
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
		{"Admin_Explorer", "ADMN-2026", "admin", "/monkey1.svg", 0},
		{"Cadet_Leo", "KIDS-1001", "user", "/monkey1.svg", 0},
		{"Cadet_Maya", "KIDS-1002", "user", "/Profile.svg", 0},
		{"Cadet_Sam", "KIDS-1003", "user", "/monkey1.svg", 0},
	}

	for _, u := range seedUsers {
		_, _ = db.ExecContext(ctx, `
			INSERT INTO users (username, access_code, role, group_id, avatar, total_xp, total_stars)
			VALUES (?, ?, ?, 1, ?, 0, 0)
			ON DUPLICATE KEY UPDATE access_code = VALUES(access_code), role = VALUES(role)
		`, u.Username, u.AccessCode, u.Role, u.Avatar)
	}
}
