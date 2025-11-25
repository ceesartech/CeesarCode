#!/bin/bash

# CeesarCode Gamma Environment Build Script
# This script builds the application for gamma (pre-production) deployment

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
    echo -e "${PURPLE}🔬 CeesarCode Gamma Build${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to load environment
load_env() {
    print_status "Loading gamma environment configuration..."
    
    # Load gamma-specific env if it exists
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
    export VITE_ENV=gamma
    export VITE_API_BASE_URL="${VITE_API_BASE_URL:-}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists go; then
        missing_deps+=("Go (https://golang.org/dl/)")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("Node.js/npm (https://nodejs.org/)")
    fi
    
    if ! command_exists cargo; then
        missing_deps+=("Rust/Cargo (https://rustup.rs/)")
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

# Function to clean previous builds
clean_build() {
    print_status "Cleaning previous gamma builds..."
    
    # Remove old dist-gamma directory
    if [ -d "dist-gamma" ]; then
        rm -rf dist-gamma
        print_status "Removed old dist-gamma directory"
    fi
    
    print_success "Build cleanup complete"
}

# Function to build Rust executor
build_executor() {
    print_status "Building Rust executor for gamma..."
    
    cd src/executor
    cargo build --release
    
    if [ $? -ne 0 ]; then
        print_error "Rust executor build failed"
        exit 1
    fi
    
    cd ../..
    print_success "Rust executor built successfully"
}

# Function to build Go backend
build_backend() {
    print_status "Building Go backend for gamma..."
    
    cd src/backend
    
    # Tidy dependencies
    go mod tidy
    
    # Build with gamma-specific flags
    CGO_ENABLED=0 go build -ldflags="-s -w -X main.AppEnv=gamma" -o ../../bin/server-gamma .
    
    if [ $? -ne 0 ]; then
        print_error "Go backend build failed"
        exit 1
    fi
    
    cd ../..
    print_success "Go backend built successfully for gamma"
}

# Function to build React frontend
build_frontend() {
    print_status "Building React frontend for gamma..."
    
    cd src/frontend
    
    # Install dependencies
    npm install
    
    if [ $? -ne 0 ]; then
        print_error "npm install failed"
        exit 1
    fi
    
    # Build frontend with gamma environment
    VITE_ENV=gamma npm run build
    
    if [ $? -ne 0 ]; then
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ../..
    print_success "React frontend built successfully for gamma"
}

# Function to create gamma directory structure
create_gamma_structure() {
    print_status "Creating gamma directory structure..."
    
    # Create dist-gamma directory
    mkdir -p dist-gamma
    
    # Copy frontend build
    cp -r src/frontend/dist/* dist-gamma/
    
    # Copy backend binary
    cp bin/server-gamma dist-gamma/server
    
    # Copy executor binaries
    cp -r src/executor/target/release dist-gamma/
    
    # Copy data directory
    cp -r data dist-gamma/
    
    # Copy gamma config
    cp config/env.gamma dist-gamma/.env
    
    # Make server executable
    chmod +x dist-gamma/server
    
    print_success "Gamma structure created"
}

# Function to verify gamma build
verify_build() {
    print_status "Verifying gamma build..."
    
    local dist_dir="dist-gamma"
    local required_files=(
        "$dist_dir/server"
        "$dist_dir/index.html"
        "$dist_dir/release/executor"
        "$dist_dir/data/problems"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -e "$file" ]; then
            print_error "Required file/directory missing: $file"
            exit 1
        fi
    done
    
    # Check if server is executable
    if [ ! -x "$dist_dir/server" ]; then
        print_error "Server binary is not executable"
        exit 1
    fi
    
    print_success "Gamma build verification passed"
}

# Function to show build summary
show_build_summary() {
    echo ""
    print_success "🎉 Gamma build completed successfully!"
    echo ""
    echo -e "${CYAN}📁 Build Output:${NC}"
    echo "   • Server binary: dist-gamma/server"
    echo "   • Frontend assets: dist-gamma/assets/"
    echo "   • Executor binary: dist-gamma/release/executor"
    echo "   • Problem data: dist-gamma/data/problems/"
    echo "   • Environment: dist-gamma/.env"
    echo ""
    echo -e "${CYAN}🚀 Next Steps:${NC}"
    echo "   1. Test locally: ./scripts/start-gamma.sh"
    echo "   2. Deploy to gamma: Push to 'gamma' branch for CI/CD"
    echo "   3. Or manually deploy: docker build -f config/Dockerfile.gamma -t ceesarcode:gamma ."
    echo ""
    echo -e "${CYAN}📊 Build Size:${NC}"
    du -sh dist-gamma/ 2>/dev/null || echo "   Unable to calculate size"
    echo ""
}

# Main execution
main() {
    print_header
    
    # Check if we're in the right directory
    if [ ! -d "src/backend" ] || [ ! -d "src/frontend" ] || [ ! -d "src/executor" ]; then
        print_error "Please run this script from the CeesarCode root directory"
        exit 1
    fi
    
    # Run build steps
    load_env
    check_prerequisites
    clean_build
    build_executor
    build_backend
    build_frontend
    create_gamma_structure
    verify_build
    show_build_summary
}

# Run main function
main "$@"

