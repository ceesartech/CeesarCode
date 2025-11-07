#!/bin/bash

# CeesarCode Production Build Script
# This script builds the complete production-ready application

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
    echo -e "${PURPLE}🏗️  CeesarCode Production Build${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
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
    print_status "Cleaning previous builds..."
    
    # Remove old dist directory
    if [ -d "dist" ]; then
        rm -rf dist
        print_status "Removed old dist directory"
    fi
    
    # Remove old bin directory
    if [ -d "bin" ]; then
        rm -rf bin
        print_status "Removed old bin directory"
    fi
    
    # Clean Rust target
    if [ -d "src/executor/target" ]; then
        cd src/executor
        cargo clean
        cd ../..
        print_status "Cleaned Rust target directory"
    fi
    
    # Clean frontend dist
    if [ -d "src/frontend/dist" ]; then
        rm -rf src/frontend/dist
        print_status "Removed frontend dist directory"
    fi
    
    print_success "Build cleanup complete"
}

# Function to build Rust executor
build_executor() {
    print_status "Building Rust executor..."
    
    cd src/executor
    
    # Build in release mode
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
    print_status "Building Go backend..."
    
    cd src/backend
    
    # Tidy dependencies
    go mod tidy
    
    # Build the server
    go build -o ../../bin/server .
    
    if [ $? -ne 0 ]; then
        print_error "Go backend build failed"
        exit 1
    fi
    
    cd ../..
    print_success "Go backend built successfully"
}

# Function to build React frontend
build_frontend() {
    print_status "Building React frontend..."
    
    cd src/frontend
    
    # Install dependencies
    npm install
    
    if [ $? -ne 0 ]; then
        print_error "npm install failed"
        exit 1
    fi
    
    # Build frontend
    npm run build
    
    if [ $? -ne 0 ]; then
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ../..
    print_success "React frontend built successfully"
}

# Function to create production directory structure
create_production_structure() {
    print_status "Creating production directory structure..."
    
    # Create dist directory
    mkdir -p dist
    
    # Copy frontend build
    cp -r src/frontend/dist/* dist/
    
    # Copy backend binary
    cp bin/server dist/
    
    # Copy executor binaries
    cp -r src/executor/target/release dist/
    
    # Copy data directory
    cp -r data dist/
    
    # Make server executable
    chmod +x dist/server
    
    print_success "Production structure created"
}

# Function to verify production build
verify_build() {
    print_status "Verifying production build..."
    
    local dist_dir="dist"
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
    
    # Check if executor is executable
    if [ ! -x "$dist_dir/release/executor" ]; then
        print_error "Executor binary is not executable"
        exit 1
    fi
    
    print_success "Production build verification passed"
}

# Function to show build summary
show_build_summary() {
    echo ""
    print_success "🎉 Production build completed successfully!"
    echo ""
    echo -e "${CYAN}📁 Build Output:${NC}"
    echo "   • Server binary: dist/server"
    echo "   • Frontend assets: dist/assets/"
    echo "   • Executor binary: dist/release/executor"
    echo "   • Problem data: dist/data/problems/"
    echo ""
    echo -e "${CYAN}🚀 Next Steps:${NC}"
    echo "   1. Deploy: ./scripts/deploy-prod.sh"
    echo "   2. Start: ./scripts/start-prod.sh"
    echo "   3. Test: ./scripts/test-prod.sh"
    echo ""
    echo -e "${CYAN}📊 Build Size:${NC}"
    du -sh dist/ 2>/dev/null || echo "   Unable to calculate size"
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
    check_prerequisites
    clean_build
    build_executor
    build_backend
    build_frontend
    create_production_structure
    verify_build
    show_build_summary
}

# Run main function
main "$@"
