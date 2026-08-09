package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port          string
	Environment   string
	AllowedCORS   string
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	EmailProxyURL string
	EmailAPIKey   string
	EmailFrom     string
	EmailFromName string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	cors := os.Getenv("ALLOWED_ORIGINS")
	if cors == "" {
		cors = "https://learn2earnhq.com,https://puzzlepro.learn2earnhq.com,https://puzzlepro.resultspro.ng,http://localhost:3000,http://localhost:3001,*"
	}

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "srv2113.hstgr.io"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "3306"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "u721451974_lae"
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "*Reedb4b4"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "u721451974_lae_db"
	}

	emailProxyURL := os.Getenv("EMAIL_PROXY_URL")
	if emailProxyURL == "" {
		emailProxyURL = "https://resultspro.ng/email_proxy/api/send-email.php"
	}

	emailAPIKey := os.Getenv("EMAIL_API_KEY")
	if emailAPIKey == "" {
		emailAPIKey = "YOUR_EMAIL_PROXY_API_KEY"
	}

	emailFrom := os.Getenv("EMAIL_FROM")
	if emailFrom == "" {
		emailFrom = "info@netslogistics.com"
	}

	emailFromName := os.Getenv("EMAIL_FROM_NAME")
	if emailFromName == "" {
		emailFromName = "Nets Logistics"
	}

	return &Config{
		Port:          port,
		Environment:   env,
		AllowedCORS:   cors,
		DBHost:        dbHost,
		DBPort:        dbPort,
		DBUser:        dbUser,
		DBPassword:    dbPassword,
		DBName:        dbName,
		EmailProxyURL: emailProxyURL,
		EmailAPIKey:   emailAPIKey,
		EmailFrom:     emailFrom,
		EmailFromName: emailFromName,
	}
}

func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}
