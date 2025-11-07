#!/bin/bash

# CeesarCode Production Stop Script
# This script stops the production server

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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
    echo -e "${PURPLE}🛑 CeesarCode Production Stop${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Default configuration
DEFAULT_PID_FILE="logs/production.pid"
DEFAULT_PORT=8080

# Parse command line arguments
PID_FILE=$DEFAULT_PID_FILE
PORT=$DEFAULT_PORT
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--pid-file)
            PID_FILE="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -p, --pid-file FILE  PID file path (default: $DEFAULT_PID_FILE)"
            echo "  --port PORT          Port to check (default: $DEFAULT_PORT)"
            echo "  -f, --force          Force kill without graceful shutdown"
            echo "  --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Stop using PID file"
            echo "  $0 --port 3000              # Stop process on port 3000"
            echo "  $0 -f                       # Force kill"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to check if port is in use
port_in_use() {
    lsof -ti:"$1" >/dev/null 2>&1
}

# Function to kill process by PID
kill_by_pid() {
    local pid=$1
    local force=$2
    
    if kill -0 $pid 2>/dev/null; then
        print_status "Stopping process with PID: $pid"
        
        if [ "$force" = true ]; then
            kill -9 $pid 2>/dev/null || true
            print_success "Process forcefully killed"
        else
            # Try graceful shutdown first
            kill $pid 2>/dev/null || true
            
            # Wait for graceful shutdown
            local count=0
            while kill -0 $pid 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                print_warning "Graceful shutdown failed, force killing..."
                kill -9 $pid 2>/dev/null || true
                print_success "Process forcefully killed"
            else
                print_success "Process stopped gracefully"
            fi
        fi
    else
        print_warning "Process with PID $pid is not running"
    fi
}

# Function to kill process by port
kill_by_port() {
    local port=$1
    local force=$2
    
    if port_in_use "$port"; then
        local pids=$(lsof -ti:"$port")
        print_status "Stopping processes on port $port..."
        
        for pid in $pids; do
            kill_by_pid $pid $force
        done
        
        print_success "All processes on port $port stopped"
    else
        print_warning "No processes found on port $port"
    fi
}

# Function to cleanup PID file
cleanup_pid_file() {
    if [ -f "$PID_FILE" ]; then
        print_status "Cleaning up PID file: $PID_FILE"
        rm -f "$PID_FILE"
        print_success "PID file removed"
    fi
}

# Function to show running processes
show_running_processes() {
    print_status "Checking for running CeesarCode processes..."
    
    local found=false
    
    # Check for server processes
    if pgrep -f "dist/server" >/dev/null 2>&1; then
        print_warning "Found running server processes:"
        pgrep -f "dist/server" | while read pid; do
            echo "  PID $pid: $(ps -p $pid -o command= 2>/dev/null || echo 'Unknown')"
        done
        found=true
    fi
    
    # Check for processes on common ports
    for port in 8080 3000 9000; do
        if port_in_use "$port"; then
            local pids=$(lsof -ti:"$port")
            print_warning "Found processes on port $port:"
            for pid in $pids; do
                echo "  PID $pid: $(ps -p $pid -o command= 2>/dev/null || echo 'Unknown')"
            done
            found=true
        fi
    done
    
    if [ "$found" = false ]; then
        print_success "No CeesarCode processes found running"
    fi
}

# Main execution
main() {
    print_header
    
    # Check if we're in the right directory
    if [ ! -d "src" ]; then
        print_error "Please run this script from the CeesarCode root directory"
        exit 1
    fi
    
    # Show current status
    show_running_processes
    echo ""
    
    # Stop by PID file if it exists
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        print_status "Stopping server using PID file: $PID_FILE"
        kill_by_pid $pid $FORCE
        cleanup_pid_file
    else
        print_warning "PID file not found: $PID_FILE"
    fi
    
    # Stop by port as backup
    print_status "Stopping processes on port $PORT..."
    kill_by_port $PORT $FORCE
    
    # Final cleanup
    cleanup_pid_file
    
    # Verify all processes are stopped
    sleep 2
    if ! port_in_use "$PORT"; then
        print_success "All CeesarCode production servers have been stopped!"
    else
        print_warning "Some processes may still be running on port $PORT"
        print_status "You may need to stop them manually"
    fi
    
    echo ""
    print_success "✅ Production server stop complete!"
    echo ""
    print_status "To start the server again:"
    echo "  ./scripts/start-prod.sh"
    echo ""
    print_status "To build and start:"
    echo "  ./scripts/build-prod.sh && ./scripts/start-prod.sh"
}

# Run main function
main "$@"
