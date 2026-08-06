.PHONY: build run test clean

build:
	@echo "Building Go backend server..."
	@go build -o bin/server main.go

run: build
	@echo "Running Go backend server..."
	@./bin/server

test:
	@echo "Running tests..."
	@go test ./...

clean:
	@echo "Cleaning binaries..."
	@rm -rf bin/
