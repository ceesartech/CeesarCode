#!/bin/bash

# CeesarCode Gamma Environment Runner
# This script starts the application in gamma (pre-production) mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}🔬 CeesarCode Gamma Environment${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if port is in use
port_in_use() {
    lsof -ti:"$1" >/dev/null 2>&1
}

# Function to kill processes on port
kill_port() {
    local port=$1
    if port_in_use "$port"; then
        print_warning "Port $port is in use. Killing existing processes..."
        lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up gamma processes..."
    if [ -n "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    print_success "Cleanup complete!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Function to load environment
load_env() {
    print_status "Loading gamma environment configuration..."
    
    # Load gamma-specific env
    if [ -f "config/env.gamma" ]; then
        export $(grep -v '^#' config/env.gamma | xargs)
        print_success "Loaded config/env.gamma"
    fi
    
    # Override with .env if it exists (for secrets)
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | grep -E '^(GEMINI_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY)=' | xargs)
        print_success "Loaded API keys from .env"
    fi
    
    # Set gamma-specific environment
    export APP_ENV=gamma
    export NODE_ENV=production
}

# Main execution
main() {
    print_header
    
    # Check if gamma build exists
    if [ ! -d "dist-gamma" ]; then
        print_error "Gamma build not found. Run './scripts/build-gamma.sh' first."
        exit 1
    fi
    
    if [ ! -f "dist-gamma/server" ]; then
        print_error "Server binary not found in dist-gamma/. Run './scripts/build-gamma.sh' first."
        exit 1
    fi
    
    # Load environment
    load_env
    
    # Kill any existing processes on port 8080
    print_status "Checking for existing processes..."
    kill_port 8080
    
    # Start the gamma server
    print_status "Starting gamma server..."
    cd dist-gamma
    
    # Export environment variables for gamma
    export APP_ENV=gamma
    export PORT=${PORT:-8080}
    export EXECUTOR_MODE=${EXECUTOR_MODE:-docker}
    
    # Log AI key status
    if [ -n "$GEMINI_API_KEY" ]; then
        print_success "Gemini API key loaded"
    fi
    if [ -n "$OPENAI_API_KEY" ]; then
        print_success "OpenAI API key loaded"
    fi
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        print_success "Anthropic API key loaded"
    fi
    
    # Start server
    ./server &
    SERVER_PID=$!
    cd ..
    
    # Wait for server to start
    print_status "Waiting for gamma server to start..."
    sleep 3
    
    # Check if server started successfully
    if ! port_in_use 8080; then
        print_error "Gamma server failed to start. Check logs for details."
        exit 1
    fi
    
    print_success "Gamma server started successfully!"
    
    # Display success message
    echo ""
    print_success "🎉 CeesarCode Gamma is now running!"
    echo ""
    echo -e "${CYAN}🌐 Gamma Server:${NC} http://localhost:8080"
    echo ""
    echo -e "${CYAN}📋 Gamma Environment Details:${NC}"
    echo "   • Environment: gamma (pre-production)"
    echo "   • Executor Mode: ${EXECUTOR_MODE:-docker}"
    echo "   • Log Level: ${LOG_LEVEL:-info}"
    echo ""
    echo -e "${CYAN}🔬 This is a pre-production environment for:${NC}"
    echo "   • Integration testing"
    echo "   • Performance testing"
    echo "   • Business previews/demos"
    echo "   • Validation before production deployment"
    echo ""
    echo -e "${CYAN}🛑 To stop:${NC} Press Ctrl+C"
    echo ""
    
    # Monitor process
    print_status "Press Ctrl+C to stop gamma server..."
    
    while true; do
        if ! kill -0 $SERVER_PID 2>/dev/null; then
            print_error "Gamma server process died unexpectedly"
            break
        fi
        sleep 5
    done
    
    cleanup
}

# Run main function
main "$@"

