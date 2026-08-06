# Learn Go Backend

Go backend service for the Learn application.

## API Endpoints

- `GET /api/v1/health` - Health check status
- `GET /api/v1/levels` - Game levels data

## Getting Started

### Prerequisites

- Go 1.22 or higher

### Running Locally

```bash
# Run using Go directly
go run main.go

# Or using Makefile
make run
```

### Environment Variables

| Name | Default | Description |
| --- | --- | --- |
| `PORT` | `8080` | Port for HTTP server |
| `ENV` | `development` | Environment (`development`, `production`) |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |
