package database

import (
	"context"
	"log"
	"time"
)

type Organisation struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Domain           string    `json:"domain"`
	ContactEmail     string    `json:"contact_email"`
	ContactPhone     string    `json:"contact_phone"`
	Password         string    `json:"password,omitempty"`
	LogoURL          string    `json:"logo_url,omitempty"`
	Token            string    `json:"token"`
	GoogleAdsEnabled bool      `json:"google_ads_enabled"`
	Type             string    `json:"type"` // "school" | "family" | "enterprise"
	ActiveStudents   int       `json:"active_students,omitempty"`
	Groups           []string  `json:"groups,omitempty"`
	Centres          []Centre  `json:"centres,omitempty"`
	CreatedAt        time.Time `json:"created_at,omitempty"`
}

type Centre struct {
	ID             int       `json:"id"`
	OrganisationID string    `json:"organisation_id,omitempty"`
	Name           string    `json:"name"`
	Location       string    `json:"location,omitempty"`
	Code           string    `json:"code,omitempty"`
	CreatedAt      time.Time `json:"created_at,omitempty"`
}

type Group struct {
	ID             int       `json:"id"`
	OrganisationID string    `json:"organisation_id,omitempty"`
	CentreID       int       `json:"centre_id,omitempty"`
	CentreName     string    `json:"centre_name,omitempty"`
	Name           string    `json:"name"`
	Code           string    `json:"code"`
	CreatedAt      time.Time `json:"created_at,omitempty"`
}

type User struct {
	ID               int       `json:"id"`
	Username         string    `json:"username"`
	AccessCode       string    `json:"access_code,omitempty"`
	Role             string    `json:"role"`
	OrganisationID   string    `json:"organisation_id,omitempty"`
	OrganisationName string    `json:"organisation_name,omitempty"`
	GroupID          int       `json:"group_id"`
	GroupName        string    `json:"group_name,omitempty"`
	Avatar           string    `json:"avatar"`
	AssignedWorldID  int       `json:"assigned_world_id,omitempty"`
	TotalXP          int       `json:"total_xp"`
	TotalStars       int       `json:"total_stars"`
	CreatedAt        time.Time `json:"created_at,omitempty"`
}

type Subscription struct {
	ID               string    `json:"id"`
	OrganisationID   string    `json:"organisation_id,omitempty"`
	OrganisationName string    `json:"organisation_name"`
	UserEmail        string    `json:"user_email"`
	PlanName         string    `json:"plan_name"`
	Status           string    `json:"status"`
	Seats            int       `json:"seats"`
	Price            string    `json:"price"`
	RenewalDate      string    `json:"renewal_date"`
	CreatedAt        time.Time `json:"created_at,omitempty"`
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

	createOrganisationsTable := `
	CREATE TABLE IF NOT EXISTS organisations (
		id VARCHAR(100) PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		domain VARCHAR(255) DEFAULT '',
		contact_email VARCHAR(255) DEFAULT '',
		contact_phone VARCHAR(100) DEFAULT '',
		password VARCHAR(255) DEFAULT 'school123',
		logo_url VARCHAR(500) DEFAULT '/monkey1.svg',
		token VARCHAR(255) UNIQUE NOT NULL,
		google_ads_enabled BOOLEAN DEFAULT TRUE,
		type VARCHAR(50) DEFAULT 'school',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createCentresTable := `
	CREATE TABLE IF NOT EXISTS centres (
		id INT AUTO_INCREMENT PRIMARY KEY,
		organisation_id VARCHAR(100) DEFAULT NULL,
		name VARCHAR(255) NOT NULL,
		location VARCHAR(255) DEFAULT '',
		code VARCHAR(100) DEFAULT '',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createGroupsTable := `
	CREATE TABLE IF NOT EXISTS groups (
		id INT AUTO_INCREMENT PRIMARY KEY,
		organisation_id VARCHAR(100) DEFAULT NULL,
		centre_id INT DEFAULT NULL,
		name VARCHAR(255) NOT NULL,
		code VARCHAR(100) UNIQUE NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(100) UNIQUE NOT NULL,
		access_code VARCHAR(50) UNIQUE DEFAULT NULL,
		role VARCHAR(50) DEFAULT 'user',
		organisation_id VARCHAR(100) DEFAULT NULL,
		group_id INT DEFAULT 1,
		avatar VARCHAR(255) DEFAULT 'https://cdn.resultspro.ng/assets/character1.jpg',
		assigned_world_id INT DEFAULT 1,
		total_xp INT DEFAULT 0,
		total_stars INT DEFAULT 0,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
		FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE SET NULL
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	createSubscriptionsTable := `
	CREATE TABLE IF NOT EXISTS subscriptions (
		id VARCHAR(100) PRIMARY KEY,
		organisation_id VARCHAR(100) DEFAULT NULL,
		organisation_name VARCHAR(255) NOT NULL,
		user_email VARCHAR(255) NOT NULL,
		plan_name VARCHAR(100) DEFAULT 'School Enterprise',
		status VARCHAR(50) DEFAULT 'active',
		seats INT DEFAULT 100,
		price VARCHAR(50) DEFAULT '$299/mo',
		renewal_date VARCHAR(50) DEFAULT '2027-01-01',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE
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

	createVerificationCodesTable := `
	CREATE TABLE IF NOT EXISTS verification_codes (
		id INT AUTO_INCREMENT PRIMARY KEY,
		email VARCHAR(255) NOT NULL,
		code VARCHAR(10) NOT NULL,
		type VARCHAR(50) NOT NULL DEFAULT 'email_verification',
		expires_at TIMESTAMP NOT NULL,
		used BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		INDEX idx_email_code (email, code, type)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

	if _, err := db.ExecContext(ctx, createOrganisationsTable); err != nil {
		log.Printf("Warning: Organisations table creation error: %v", err)
	}
	_, _ = db.ExecContext(ctx, "ALTER TABLE organisations ADD COLUMN logo_url VARCHAR(500) DEFAULT '/monkey1.svg';")
	_, _ = db.ExecContext(ctx, "ALTER TABLE organisations ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;")
	if _, err := db.ExecContext(ctx, createCentresTable); err != nil {
		log.Printf("Warning: Centres table creation error: %v", err)
	}
	if _, err := db.ExecContext(ctx, createGroupsTable); err != nil {
		log.Printf("Warning: Groups table creation error: %v", err)
	}
	_, _ = db.ExecContext(ctx, "ALTER TABLE groups ADD COLUMN organisation_id VARCHAR(100) DEFAULT NULL;")
	_, _ = db.ExecContext(ctx, "ALTER TABLE groups ADD COLUMN centre_id INT DEFAULT NULL;")

	if _, err := db.ExecContext(ctx, createUsersTable); err != nil {
		log.Printf("Warning: Users table creation error: %v", err)
	}
	_, _ = db.ExecContext(ctx, "ALTER TABLE users ADD COLUMN access_code VARCHAR(50) UNIQUE DEFAULT NULL;")
	_, _ = db.ExecContext(ctx, "ALTER TABLE users ADD COLUMN organisation_id VARCHAR(100) DEFAULT NULL;")
	_, _ = db.ExecContext(ctx, "ALTER TABLE users ADD COLUMN assigned_world_id INT DEFAULT 1;")

	if _, err := db.ExecContext(ctx, createSubscriptionsTable); err != nil {
		log.Printf("Warning: Subscriptions table creation error: %v", err)
	}

	if _, err := db.ExecContext(ctx, createUserProgressTable); err != nil {
		log.Printf("Warning: User Progress table creation error: %v", err)
	}
	_, _ = db.ExecContext(ctx, "ALTER TABLE user_progress ADD COLUMN world_id INT DEFAULT 1;")
	_, _ = db.ExecContext(ctx, "ALTER TABLE user_progress ADD COLUMN adventure_id INT DEFAULT 1;")

	if _, err := db.ExecContext(ctx, createVerificationCodesTable); err != nil {
		log.Printf("Warning: Verification codes table creation error: %v", err)
	}

	db.seedAccessCodeUsers(ctx)

	log.Println("✅ [player_service] Microservice tables (organisations, groups, users, subscriptions, user_progress) initialized.")
	return nil
}

func (db *DB) seedAccessCodeUsers(ctx context.Context) {
	_, _ = db.ExecContext(ctx, `
		INSERT INTO organisations (id, name, domain, contact_email, contact_phone, token, google_ads_enabled, type)
		VALUES ('org_001', 'STEM Explorers Academy', 'stemexplorers.edu', 'admin@stemexplorers.edu', '+1 (555) 234-5678', 'TOKEN_STEM_9932A', false, 'school')
		ON DUPLICATE KEY UPDATE name = VALUES(name)
	`)

	_, _ = db.ExecContext(ctx, `
		INSERT INTO organisations (id, name, domain, contact_email, contact_phone, token, google_ads_enabled, type)
		VALUES ('org_skil_9901', 'SkillUp Learning Academy', 'skilluplearningacademy.com', 'contact@skilluplearningacademy.com', '+1 (555) 019-2831', 'TOKEN_SKIL_9901', true, 'school')
		ON DUPLICATE KEY UPDATE domain = VALUES(domain), token = VALUES(token)
	`)

	_, _ = db.ExecContext(ctx, "INSERT IGNORE INTO centres (id, organisation_id, name, location, code) VALUES (1, 'org_001', 'Main Campus', 'Central Education Hub', '784912')")
	_, _ = db.ExecContext(ctx, "INSERT IGNORE INTO groups (id, organisation_id, centre_id, name, code) VALUES (1, 'org_001', 1, 'Grade 5 Coding Class', '784912')")
	_, _ = db.ExecContext(ctx, "INSERT IGNORE INTO groups (id, organisation_id, centre_id, name, code) VALUES (2, 'org_001', 1, 'Senior Coders Club', '592810')")
	_, _ = db.ExecContext(ctx, "INSERT IGNORE INTO groups (id, organisation_id, centre_id, name, code) VALUES (3, 'org_001', 1, 'STEM Lab 1', '310492')")

	seedUsers := []struct {
		Username       string
		AccessCode     string
		Role           string
		OrganisationID string
		Avatar         string
		WorldID        int
		XP             int
	}{
		{"Admin_Explorer", "ADMN-2026", "admin", "org_001", "/images/character1.jpg", 1, 0},
		{"Alex Johnson", "83920193", "student", "org_001", "/images/character1.jpg", 1, 450},
		{"Sarah Williams", "47201948", "student", "org_001", "/images/character2.jpg", 2, 820},
		{"David Chen", "91823746", "student", "org_001", "/images/character3.jpg", 3, 1200},
	}

	for _, u := range seedUsers {
		_, _ = db.ExecContext(ctx, `
			INSERT INTO users (username, access_code, role, organisation_id, group_id, avatar, assigned_world_id, total_xp, total_stars)
			VALUES (?, ?, ?, ?, 1, ?, ?, ?, 0)
			ON DUPLICATE KEY UPDATE access_code = VALUES(access_code), role = VALUES(role), organisation_id = VALUES(organisation_id), assigned_world_id = VALUES(assigned_world_id)
		`, u.Username, u.AccessCode, u.Role, u.OrganisationID, u.Avatar, u.WorldID, u.XP)
	}
}
