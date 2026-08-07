package database

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache struct {
	Client *redis.Client
}

func ConnectRedis(redisURL string) *Cache {
	if redisURL == "" {
		log.Println("ℹ️ [game_engine] REDIS_URL not set. Running with MySQL database direct queries.")
		return nil
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("⚠️ Warning: Invalid REDIS_URL (%v). Bypassing Redis cache.", err)
		return nil
	}

	client := redis.NewClient(opt)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️ Warning: Could not ping Redis (%v). Bypassing Redis cache.", err)
		return nil
	}

	log.Println("⚡ [game_engine] Connected to Redis cache service.")
	return &Cache{Client: client}
}

func (c *Cache) Get(ctx context.Context, key string) (string, bool) {
	if c == nil || c.Client == nil {
		return "", false
	}
	val, err := c.Client.Get(ctx, key).Result()
	if err != nil {
		return "", false
	}
	return val, true
}

func (c *Cache) Set(ctx context.Context, key string, value string, expiration time.Duration) {
	if c == nil || c.Client == nil {
		return
	}
	_ = c.Client.Set(ctx, key, value, expiration).Err()
}

func (c *Cache) Del(ctx context.Context, keys ...string) {
	if c == nil || c.Client == nil || len(keys) == 0 {
		return
	}
	_ = c.Client.Del(ctx, keys...).Err()
}
