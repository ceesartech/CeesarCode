#!/bin/bash

# CeesarCode Production Start Script
# This script starts the production server

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
    echo -e "${PURPLE}🚀 CeesarCode Production Server${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Default configuration
DEFAULT_PORT=8080
DEFAULT_HOST="0.0.0.0"
DEFAULT_LOG_FILE="logs/production.log"
DEFAULT_PID_FILE="logs/production.pid"

# Parse command line arguments
PORT=$DEFAULT_PORT
HOST=$DEFAULT_HOST
LOG_FILE=$DEFAULT_LOG_FILE
PID_FILE=$DEFAULT_PID_FILE
DAEMON_MODE=false
FOREGROUND=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -h|--host)
            HOST="$2"
            shift 2
            ;;
        -l|--log)
            LOG_FILE="$2"
            shift 2
            ;;
        -d|--daemon)
            DAEMON_MODE=true
            shift
            ;;
        -f|--foreground)
            FOREGROUND=true
            shift
            ;;
        -p|--provider)
            AI_PROVIDER="$2"
            shift 2
            ;;
        -k|--api-key)
            API_KEY="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS] [GEMINI_API_KEY]"
            echo ""
            echo "Options:"
            echo "  -p, --port PORT      Port to listen on (default: $DEFAULT_PORT)"
            echo "  -h, --host HOST      Host to bind to (default: $DEFAULT_HOST)"
            echo "  -l, --log FILE       Log file path (default: $DEFAULT_LOG_FILE)"
            echo "  --provider PROVIDER  AI provider: gemini, openai, or claude (default: gemini)"
            echo "  -k, --api-key KEY    API key for AI question generation"
            echo "  -d, --daemon         Run as daemon in background"
            echo "  -f, --foreground     Run in foreground (default)"
            echo "  --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Start on default port 8080"
            echo "  $0 -p 3000 -d                        # Start on port 3000 as daemon"
            echo "  $0 --provider openai -k YOUR_KEY     # Start with OpenAI API key"
            echo "  $0 --provider claude -k YOUR_KEY -d   # Start with Claude API key as daemon"
            echo ""
            echo "AI Agent:"
            echo "  API key can be provided via:"
            echo "  1. Command line: --provider PROVIDER -k/--api-key KEY"
            echo "  2. .env file (GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY)"
            echo "  3. Run './scripts/setup-ai.sh' to configure AI question generation"
            echo "  AI Agent generates unique, contextual questions based on company/role/level"
            exit 0
            ;;
        *)
            # Check if it's a positional argument (API key without flag)
            if [[ "$1" =~ ^(AIza|sk-|sk-ant-) ]]; then
                API_KEY="$1"
                # Auto-detect provider from key prefix
                if [[ "$1" =~ ^AIza ]]; then
                    AI_PROVIDER="gemini"
                elif [[ "$1" =~ ^sk-ant- ]]; then
                    AI_PROVIDER="claude"
                elif [[ "$1" =~ ^sk- ]]; then
                    AI_PROVIDER="openai"
                fi
                shift
            else
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
            fi
            ;;
    esac
done

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

# Function to check if production build exists
check_production_build() {
    print_status "Checking production build..."
    
    local dist_dir="dist"
    local required_files=(
        "$dist_dir/server"
        "$dist_dir/index.html"
        "$dist_dir/release/executor"
        "$dist_dir/data/problems"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -e "$file" ]; then
            print_error "Production build not found: $file"
            print_status "Run './scripts/build-prod.sh' first to build the application"
            exit 1
        fi
    done
    
    print_success "Production build verified"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p dist
    
    print_success "Directories created"
}

# Function to load AI API key
load_ai_key() {
    # Default provider
    AI_PROVIDER=${AI_PROVIDER:-gemini}
    
    # If API key already set from command line, use it
    if [ -n "$API_KEY" ]; then
        case "$AI_PROVIDER" in
            gemini)
                GEMINI_API_KEY="$API_KEY"
                export GEMINI_API_KEY
                print_success "AI Agent enabled with Gemini API key from command line"
                ;;
            openai)
                OPENAI_API_KEY="$API_KEY"
                export OPENAI_API_KEY
                print_success "AI Agent enabled with OpenAI API key from command line"
                ;;
            claude)
                ANTHROPIC_API_KEY="$API_KEY"
                export ANTHROPIC_API_KEY
                print_success "AI Agent enabled with Claude API key from command line"
                ;;
        esac
        return
    fi
    
    # Otherwise, try loading from .env file
    if [ -f ".env" ]; then
        print_status "Loading AI API keys from .env file..."
        source .env
        case "$AI_PROVIDER" in
            gemini)
                if [ -n "$GEMINI_API_KEY" ]; then
                    export GEMINI_API_KEY
                    print_success "AI Agent enabled with Gemini API key from .env file"
                else
                    print_warning "GEMINI_API_KEY not found in .env file - AI Agent will use fallback templates"
                fi
                ;;
            openai)
                if [ -n "$OPENAI_API_KEY" ]; then
                    export OPENAI_API_KEY
                    print_success "AI Agent enabled with OpenAI API key from .env file"
                else
                    print_warning "OPENAI_API_KEY not found in .env file - AI Agent will use fallback templates"
                fi
                ;;
            claude)
                if [ -n "$ANTHROPIC_API_KEY" ]; then
                    export ANTHROPIC_API_KEY
                    print_success "AI Agent enabled with Claude API key from .env file"
                else
                    print_warning "ANTHROPIC_API_KEY not found in .env file - AI Agent will use fallback templates"
                fi
                ;;
        esac
    else
        print_warning ".env file not found - AI Agent will use fallback templates"
        print_status "Run './scripts/setup-ai.sh' or use -p/--provider and -k/--api-key flags to set up AI generation"
    fi
}

# Function to start server in foreground
start_foreground() {
    print_status "Starting production server in foreground..."
    print_status "Server will be available at: http://$HOST:$PORT"
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    cd dist
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
    exec ./server
}

# Function to start server as daemon
start_daemon() {
    print_status "Starting production server as daemon..."
    
    cd dist
    
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
    
    # Start server in background
    nohup ./server > "../$LOG_FILE" 2>&1 &
    local server_pid=$!
    
    # Save PID
    echo $server_pid > "../$PID_FILE"
    
    cd ..
    
    # Wait a moment for server to start
    sleep 3
    
    # Check if server is running
    if kill -0 $server_pid 2>/dev/null; then
        print_success "Production server started successfully!"
        print_status "PID: $server_pid"
        print_status "Log file: $LOG_FILE"
        print_status "PID file: $PID_FILE"
        print_status "Server available at: http://$HOST:$PORT"
        echo ""
        print_status "To stop the server: ./scripts/stop-prod.sh"
        print_status "To view logs: tail -f $LOG_FILE"
    else
        print_error "Failed to start production server"
        print_status "Check log file: $LOG_FILE"
        exit 1
    fi
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null || true
        fi
        rm -f "$PID_FILE"
    fi
    print_success "Cleanup complete"
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_header
    
    # Check if we're in the right directory
    if [ ! -d "src" ]; then
        print_error "Please run this script from the CeesarCode root directory"
        exit 1
    fi
    
    # Run setup steps
    check_production_build
    create_directories
    load_ai_key
    kill_port $PORT
    
    # Start server based on mode
    if [ "$DAEMON_MODE" = true ]; then
        start_daemon
    else
        start_foreground
    fi
}

# Run main function
main "$@"
