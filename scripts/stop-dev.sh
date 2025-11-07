#!/bin/bash

# CeesarCode Development Stop Script
# This script stops all running development servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo -e "${BLUE}🛑 Stopping CeesarCode Development Servers${NC}"
echo "=============================================="

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local service_name=$2
    
    if lsof -ti:"$port" >/dev/null 2>&1; then
        print_status "Stopping $service_name on port $port..."
        lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
        print_success "$service_name stopped"
    else
        print_warning "$service_name was not running on port $port"
    fi
}

# Function to kill processes by name
kill_process() {
    local process_name=$1
    local service_name=$2
    
    if pgrep -f "$process_name" >/dev/null 2>&1; then
        print_status "Stopping $service_name..."
        pkill -f "$process_name" 2>/dev/null || true
        print_success "$service_name stopped"
    else
        print_warning "$service_name was not running"
    fi
}

# Stop services
kill_port 8080 "Backend Server"
kill_port 5173 "Frontend Server"

# Kill by process name as backup
kill_process "go run main.go" "Go Backend"
kill_process "npm run dev" "NPM Frontend"
kill_process "vite" "Vite Dev Server"

# Wait a moment for processes to fully stop
sleep 2

# Verify all processes are stopped
if ! lsof -ti:8080 >/dev/null 2>&1 && ! lsof -ti:5173 >/dev/null 2>&1; then
    print_success "All CeesarCode development servers have been stopped!"
else
    print_warning "Some processes may still be running. You may need to stop them manually."
fi

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo ""
echo "To start development servers again, run:"
echo "  ./scripts/start-dev.sh"
