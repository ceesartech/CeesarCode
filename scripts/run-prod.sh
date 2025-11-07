#!/bin/bash

# CeesarCode Complete Production Pipeline
# This script chains all production scripts for automated deployment

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
    echo -e "${PURPLE}🚀 CeesarCode Complete Pipeline${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Default configuration
DEFAULT_PORT=8080
DEFAULT_HOST="0.0.0.0"
DEFAULT_DEPLOY_DIR="/opt/ceesarcode"
DEFAULT_USER="ceesarcode"
DEFAULT_SERVICE_NAME="ceesarcode"

# Parse command line arguments
PORT=$DEFAULT_PORT
HOST=$DEFAULT_HOST
DEPLOY_DIR=$DEFAULT_DEPLOY_DIR
USER=$DEFAULT_USER
SERVICE_NAME=$DEFAULT_SERVICE_NAME
SKIP_BUILD=false
SKIP_TEST=false
SKIP_DEPLOY=false
DOCKER_MODE=false
LOCAL_MODE=false
FORCE=false

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
        -d|--deploy-dir)
            DEPLOY_DIR="$2"
            shift 2
            ;;
        -u|--user)
            USER="$2"
            shift 2
            ;;
        -s|--service)
            SERVICE_NAME="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-test)
            SKIP_TEST=true
            shift
            ;;
        --skip-deploy)
            SKIP_DEPLOY=true
            shift
            ;;
        --docker)
            DOCKER_MODE=true
            shift
            ;;
        --local)
            LOCAL_MODE=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -p, --port PORT          Port to listen on (default: $DEFAULT_PORT)"
            echo "  -h, --host HOST          Host to bind to (default: $DEFAULT_HOST)"
            echo "  -d, --deploy-dir DIR     Deployment directory (default: $DEFAULT_DEPLOY_DIR)"
            echo "  -u, --user USER          User to run service as (default: $DEFAULT_USER)"
            echo "  -s, --service NAME       Service name (default: $DEFAULT_SERVICE_NAME)"
            echo "  --skip-build             Skip building the application"
            echo "  --skip-test              Skip testing the application"
            echo "  --skip-deploy            Skip deployment (local mode only)"
            echo "  --docker                 Deploy using Docker"
            echo "  --local                  Local development mode"
            echo "  --force                  Force operations without confirmation"
            echo "  --help                   Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Full production deployment"
            echo "  $0 --local                           # Local development mode"
            echo "  $0 --docker                          # Docker deployment"
            echo "  $0 --local --skip-deploy             # Build and test only"
            echo "  $0 -p 3000 -d /var/www/ceesarcode    # Custom configuration"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ] && [ "$LOCAL_MODE" = false ] && [ "$DOCKER_MODE" = true ]; then
        print_error "This script must be run as root for system deployment"
        print_status "Use: sudo $0"
        exit 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command -v go >/dev/null 2>&1; then
        missing_deps+=("Go (https://golang.org/dl/)")
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        missing_deps+=("Node.js/npm (https://nodejs.org/)")
    fi
    
    if ! command -v cargo >/dev/null 2>&1; then
        missing_deps+=("Rust/Cargo (https://rustup.rs/)")
    fi
    
    if [ "$DOCKER_MODE" = true ] && ! command -v docker >/dev/null 2>&1; then
        missing_deps+=("Docker (https://docker.com/)")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  • $dep"
        done
        exit 1
    fi
    
    print_success "All prerequisites found"
}

# Function to clean previous processes
cleanup_processes() {
    print_status "Cleaning up previous processes..."
    
    # Kill any existing processes
    pkill -f "go run main.go" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "dist/server" 2>/dev/null || true
    
    # Kill processes on common ports
    for port in 8080 3000 5173; do
        if lsof -ti:"$port" >/dev/null 2>&1; then
            print_warning "Killing processes on port $port"
            lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
        fi
    done
    
    sleep 2
    print_success "Process cleanup complete"
}

# Function to run build script
run_build() {
    if [ "$SKIP_BUILD" = true ]; then
        print_warning "Skipping build step"
        return 0
    fi
    
    print_status "Running build script..."
    
    if [ ! -f "scripts/build-prod.sh" ]; then
        print_error "Build script not found: scripts/build-prod.sh"
        exit 1
    fi
    
    chmod +x scripts/build-prod.sh
    ./scripts/build-prod.sh
    
    print_success "Build completed successfully"
}

# Function to run test script
run_test() {
    if [ "$SKIP_TEST" = true ]; then
        print_warning "Skipping test step"
        return 0
    fi
    
    print_status "Running test script..."
    
    if [ ! -f "scripts/test-prod.sh" ]; then
        print_error "Test script not found: scripts/test-prod.sh"
        exit 1
    fi
    
    chmod +x scripts/test-prod.sh
    
    # Start server for testing if not in local mode
    if [ "$LOCAL_MODE" = false ]; then
        print_status "Starting server for testing..."
        
        # Start server in background
        cd dist
        ./server > ../logs/test-server.log 2>&1 &
        local test_server_pid=$!
        cd ..
        
        # Wait for server to start
        sleep 5
        
        # Test the server
        ./scripts/test-prod.sh -h $HOST -p $PORT
        
        # Stop test server
        kill $test_server_pid 2>/dev/null || true
        sleep 2
    else
        # In local mode, just run tests (server will be started separately)
        ./scripts/test-prod.sh -h $HOST -p $PORT
    fi
    
    print_success "Tests completed successfully"
}

# Function to run local mode
run_local() {
    print_status "Starting local development mode..."
    
    # Start backend
    print_status "Starting backend server..."
    cd src/backend
    go run main.go > ../../logs/backend.log 2>&1 &
    local backend_pid=$!
    cd ../..
    
    # Wait for backend to start
    sleep 3
    
    # Start frontend
    print_status "Starting frontend server..."
    cd src/frontend
    npm install >/dev/null 2>&1
    npm run dev > ../../logs/frontend.log 2>&1 &
    local frontend_pid=$!
    cd ../..
    
    # Wait for frontend to start
    sleep 5
    
    # Test the setup
    print_status "Testing local setup..."
    if curl -s --connect-timeout 10 "http://localhost:8080/api/problems" >/dev/null; then
        print_success "Local development environment is running!"
        echo ""
        echo -e "${CYAN}🌐 Access Your App:${NC}"
        echo "   • Frontend: http://localhost:5173"
        echo "   • Backend API: http://localhost:8080/api/problems"
        echo ""
        echo -e "${CYAN}🔧 Management:${NC}"
        echo "   • Backend PID: $backend_pid"
        echo "   • Frontend PID: $frontend_pid"
        echo "   • Backend logs: tail -f logs/backend.log"
        echo "   • Frontend logs: tail -f logs/frontend.log"
        echo "   • Stop: ./scripts/stop-dev.sh"
        echo ""
        echo -e "${CYAN}Press Ctrl+C to stop both servers${NC}"
        
        # Wait for user interrupt
        trap 'kill $backend_pid $frontend_pid 2>/dev/null; exit 0' INT
        wait
    else
        print_error "Local setup failed"
        kill $backend_pid $frontend_pid 2>/dev/null || true
        exit 1
    fi
}

# Function to run deployment
run_deploy() {
    if [ "$SKIP_DEPLOY" = true ]; then
        print_warning "Skipping deployment step"
        return 0
    fi
    
    print_status "Running deployment script..."
    
    if [ ! -f "scripts/deploy-prod.sh" ]; then
        print_error "Deploy script not found: scripts/deploy-prod.sh"
        exit 1
    fi
    
    chmod +x scripts/deploy-prod.sh
    
    # Build deployment command
    local deploy_cmd="./scripts/deploy-prod.sh"
    deploy_cmd="$deploy_cmd -p $PORT -h $HOST -d $DEPLOY_DIR -u $USER -s $SERVICE_NAME"
    
    if [ "$DOCKER_MODE" = true ]; then
        deploy_cmd="$deploy_cmd --docker"
    fi
    
    if [ "$FORCE" = true ]; then
        deploy_cmd="$deploy_cmd --no-backup"
    fi
    
    # Run deployment
    eval $deploy_cmd
    
    print_success "Deployment completed successfully"
}

# Function to show final summary
show_summary() {
    echo ""
    print_success "🎉 Complete pipeline finished successfully!"
    echo ""
    echo -e "${CYAN}📊 Pipeline Summary:${NC}"
    echo "   • Build: $([ "$SKIP_BUILD" = true ] && echo "Skipped" || echo "Completed")"
    echo "   • Test: $([ "$SKIP_TEST" = true ] && echo "Skipped" || echo "Completed")"
    echo "   • Deploy: $([ "$SKIP_DEPLOY" = true ] && echo "Skipped" || echo "Completed")"
    echo "   • Mode: $([ "$LOCAL_MODE" = true ] && echo "Local Development" || ([ "$DOCKER_MODE" = true ] && echo "Docker" || echo "Systemd"))"
    echo ""
    
    if [ "$LOCAL_MODE" = true ]; then
        echo -e "${CYAN}🌐 Local Development:${NC}"
        echo "   • Frontend: http://localhost:5173"
        echo "   • Backend: http://localhost:8080"
        echo "   • Stop: ./scripts/stop-dev.sh"
    else
        echo -e "${CYAN}🌐 Production Access:${NC}"
        echo "   • URL: http://$HOST:$PORT"
        echo "   • API: http://$HOST:$PORT/api/problems"
        echo ""
        echo -e "${CYAN}🔧 Management:${NC}"
        if [ "$DOCKER_MODE" = true ]; then
            echo "   • Stop: docker stop ceesarcode"
            echo "   • Start: docker start ceesarcode"
            echo "   • Logs: docker logs -f ceesarcode"
        else
            echo "   • Stop: systemctl stop $SERVICE_NAME"
            echo "   • Start: systemctl start $SERVICE_NAME"
            echo "   • Logs: journalctl -u $SERVICE_NAME -f"
        fi
    fi
    echo ""
}

# Main execution
main() {
    print_header
    
    # Check if we're in the right directory
    if [ ! -d "src" ]; then
        print_error "Please run this script from the CeesarCode root directory"
        exit 1
    fi
    
    # Create logs directory
    mkdir -p logs
    
    # Run pipeline steps
    check_root
    check_prerequisites
    cleanup_processes
    
    if [ "$LOCAL_MODE" = true ]; then
        run_local
    else
        run_build
        run_test
        run_deploy
    fi
    
    show_summary
}

# Run main function
main "$@"
