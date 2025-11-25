#!/bin/bash

# CeesarCode Gamma Environment Stop Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is in use
port_in_use() {
    lsof -ti:"$1" >/dev/null 2>&1
}

# Function to kill processes on port
kill_port() {
    local port=$1
    if port_in_use "$port"; then
        print_status "Killing processes on port $port..."
        lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
        sleep 1
        if ! port_in_use "$port"; then
            print_success "Port $port freed successfully"
        else
            print_error "Failed to free port $port"
        fi
    else
        print_status "Port $port is not in use"
    fi
}

main() {
    echo "Stopping CeesarCode Gamma Environment..."
    
    # Kill server on port 8080
    kill_port 8080
    
    # Kill any gamma-specific processes
    pkill -f "dist-gamma/server" 2>/dev/null || true
    
    print_success "🛑 CeesarCode Gamma stopped"
}

main "$@"

