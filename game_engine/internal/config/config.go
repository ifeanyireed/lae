package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	Environment string
	AllowedCORS string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	RedisURL    string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	cors := os.Getenv("ALLOWED_ORIGINS")
	if cors == "" {
		cors = "http://localhost:3000,http://localhost:3001,*"
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

	redisURL := os.Getenv("REDIS_URL")

	return &Config{
		Port:        port,
		Environment: env,
		AllowedCORS: cors,
		DBHost:      dbHost,
		DBPort:      dbPort,
		DBUser:      dbUser,
		DBPassword:  dbPassword,
		DBName:      dbName,
		RedisURL:    redisURL,
	}
}

func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}
