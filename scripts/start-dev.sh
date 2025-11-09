#!/bin/bash

# CeesarCode Local Development Runner
# This script starts both backend and frontend for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
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
    echo -e "${PURPLE}🚀 CeesarCode Local Development${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
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
    print_status "Cleaning up processes..."
    pkill -f "go run main.go" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    print_success "Cleanup complete!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_header
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command_exists go; then
        print_error "Go is not installed. Please install Go 1.19+ from https://golang.org/dl/"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "Node.js/npm is not installed. Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
    
    # Check if we're in the right directory
    if [ ! -d "src/backend" ] || [ ! -d "src/frontend" ]; then
        print_error "Please run this script from the CeesarCode root directory"
        exit 1
    fi
    
    # Kill any existing processes on our ports
    print_status "Checking for existing processes..."
    kill_port 8080
    kill_port 5173
    
    # Load AI API key and provider - check command line arguments first, then .env file
    AI_PROVIDER="gemini"
    GEMINI_API_KEY=""
    OPENAI_API_KEY=""
    ANTHROPIC_API_KEY=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--provider)
                AI_PROVIDER="$2"
                shift 2
                ;;
            -k|--api-key)
                case "$AI_PROVIDER" in
                    gemini) GEMINI_API_KEY="$2" ;;
                    openai) OPENAI_API_KEY="$2" ;;
                    claude) ANTHROPIC_API_KEY="$2" ;;
                esac
                shift 2
                ;;
            *)
                # Legacy: treat first positional arg as Gemini API key
                if [ -z "$GEMINI_API_KEY" ] && [[ "$1" =~ ^AIza ]]; then
                    GEMINI_API_KEY="$1"
                    shift
                else
                    shift
                fi
                ;;
        esac
    done
    
    # Fallback to .env file if not provided via command line
    if [ -f ".env" ]; then
        print_status "Loading AI API keys from .env file..."
        # Save current values before sourcing
        OLD_GEMINI="$GEMINI_API_KEY"
        OLD_OPENAI="$OPENAI_API_KEY"
        OLD_ANTHROPIC="$ANTHROPIC_API_KEY"
        source .env
        # Restore command-line values if they were set, otherwise use .env values
        if [ -n "$OLD_GEMINI" ]; then
            GEMINI_API_KEY="$OLD_GEMINI"
        fi
        if [ -n "$OLD_OPENAI" ]; then
            OPENAI_API_KEY="$OLD_OPENAI"
        fi
        if [ -n "$OLD_ANTHROPIC" ]; then
            ANTHROPIC_API_KEY="$OLD_ANTHROPIC"
        fi
    fi
    
    # Set appropriate API key based on provider
    case "$AI_PROVIDER" in
        gemini)
            if [ -n "$GEMINI_API_KEY" ]; then
                print_success "AI Agent enabled with Gemini API key"
                export GEMINI_API_KEY
            else
                print_warning "GEMINI_API_KEY not found - AI Agent will use fallback templates"
            fi
            ;;
        openai)
            if [ -n "$OPENAI_API_KEY" ]; then
                print_success "AI Agent enabled with OpenAI API key"
                export OPENAI_API_KEY
            else
                print_warning "OPENAI_API_KEY not found - AI Agent will use fallback templates"
            fi
            ;;
        claude)
            if [ -n "$ANTHROPIC_API_KEY" ]; then
                print_success "AI Agent enabled with Claude API key"
                export ANTHROPIC_API_KEY
            else
                print_warning "ANTHROPIC_API_KEY not found - AI Agent will use fallback templates"
            fi
            ;;
    esac
    
    print_status "Usage: $0 [-p|--provider gemini|openai|claude] [-k|--api-key KEY]"
    print_status "  Or run './scripts/setup-ai.sh' to set up AI generation"
    
    # Start backend
    print_status "Starting Go backend server..."
    cd src/backend
    # Export all API keys (backend will choose based on request)
    if [ -n "$GEMINI_API_KEY" ]; then
        export GEMINI_API_KEY
    fi
    if [ -n "$OPENAI_API_KEY" ]; then
        export OPENAI_API_KEY
    fi
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        export ANTHROPIC_API_KEY
    fi
    go run main.go > ../../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ../..
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    sleep 3
    
    # Check if backend started successfully
    if ! port_in_use 8080; then
        print_error "Backend failed to start. Check logs/backend.log for details."
        exit 1
    fi
    
    print_success "Backend started successfully on http://localhost:8080"
    
    # Start frontend
    print_status "Starting React frontend..."
    cd src/frontend
    
    # Check if node_modules exists, if not install dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    npm run dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ../..
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    sleep 5
    
    # Check if frontend started successfully
    if ! port_in_use 5173; then
        print_error "Frontend failed to start. Check logs/frontend.log for details."
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    print_success "Frontend started successfully on http://localhost:5173"
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Display success message
    echo ""
    print_success "🎉 CeesarCode is now running!"
    echo ""
    echo -e "${CYAN}🌐 Frontend:${NC} http://localhost:5173"
    echo -e "${CYAN}🔧 Backend API:${NC} http://localhost:8080"
    echo ""
    echo -e "${CYAN}📋 What you can do:${NC}"
    echo "   • Open http://localhost:5173 in your browser"
    echo "   • Select a coding problem from the sidebar"
    echo "   • Choose a programming language"
    echo "   • Write and test your code"
    echo "   • Use Run Code or Submit Code buttons"
    echo "   • Use 🤖 AI Agent to generate custom questions"
    echo ""
    echo -e "${CYAN}🛑 To stop:${NC} Press Ctrl+C or run: ./scripts/stop-dev.sh"
    echo ""
    echo -e "${CYAN}📊 Logs:${NC}"
    echo "   • Backend: logs/backend.log"
    echo "   • Frontend: logs/frontend.log"
    echo ""
    
    # Keep script running and show logs
    print_status "Press Ctrl+C to stop all services..."
    
    # Monitor processes
    while true; do
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            print_error "Backend process died unexpectedly"
            break
        fi
        
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            print_error "Frontend process died unexpectedly"
            break
        fi
        
        sleep 5
    done
    
    cleanup
}

# Run main function
main "$@"
