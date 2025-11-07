#!/bin/bash

# CeesarCode Production Deployment Script
# This script handles complete production deployment

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
    echo -e "${PURPLE}🚀 CeesarCode Production Deploy${NC}"
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
SKIP_SERVICE=false
DOCKER_MODE=false
BACKUP_MODE=true

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
        --skip-service)
            SKIP_SERVICE=true
            shift
            ;;
        --docker)
            DOCKER_MODE=true
            shift
            ;;
        --no-backup)
            BACKUP_MODE=false
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
            echo "  --skip-service           Skip creating systemd service"
            echo "  --docker                 Deploy using Docker"
            echo "  --no-backup              Skip creating backup"
            echo "  --help                   Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Full deployment"
            echo "  $0 --skip-build --skip-test          # Deploy existing build"
            echo "  $0 --docker                          # Docker deployment"
            echo "  $0 -d /var/www/ceesarcode -p 3000    # Custom directory and port"
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
    if [ "$EUID" -ne 0 ] && [ "$DOCKER_MODE" = false ]; then
        print_error "This script must be run as root for system deployment"
        print_status "Use: sudo $0"
        exit 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking deployment prerequisites..."
    
    local missing_deps=()
    
    if ! command -v curl >/dev/null 2>&1; then
        missing_deps+=("curl")
    fi
    
    if [ "$DOCKER_MODE" = true ]; then
        if ! command -v docker >/dev/null 2>&1; then
            missing_deps+=("docker")
        fi
    else
        if ! command -v systemctl >/dev/null 2>&1; then
            missing_deps+=("systemctl (systemd)")
        fi
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  • $dep"
        done
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to build application
build_application() {
    if [ "$SKIP_BUILD" = true ]; then
        print_warning "Skipping build step"
        return 0
    fi
    
    print_status "Building application..."
    
    if [ ! -f "scripts/build-prod.sh" ]; then
        print_error "Build script not found: scripts/build-prod.sh"
        exit 1
    fi
    
    chmod +x scripts/build-prod.sh
    ./scripts/build-prod.sh
    
    print_success "Application built successfully"
}

# Function to test application
test_application() {
    if [ "$SKIP_TEST" = true ]; then
        print_warning "Skipping test step"
        return 0
    fi
    
    print_status "Testing application..."
    
    if [ ! -f "scripts/test-prod.sh" ]; then
        print_error "Test script not found: scripts/test-prod.sh"
        exit 1
    fi
    
    chmod +x scripts/test-prod.sh
    ./scripts/test-prod.sh -h $HOST -p $PORT
    
    print_success "Application tests passed"
}

# Function to create backup
create_backup() {
    if [ "$BACKUP_MODE" = false ]; then
        print_warning "Skipping backup creation"
        return 0
    fi
    
    if [ -d "$DEPLOY_DIR" ]; then
        print_status "Creating backup of existing deployment..."
        
        local backup_dir="${DEPLOY_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
        cp -r "$DEPLOY_DIR" "$backup_dir"
        
        print_success "Backup created: $backup_dir"
    else
        print_status "No existing deployment found, skipping backup"
    fi
}

# Function to deploy files
deploy_files() {
    print_status "Deploying application files..."
    
    # Create deployment directory
    mkdir -p "$DEPLOY_DIR"
    
    # Copy application files
    cp -r dist/* "$DEPLOY_DIR/"
    
    # Copy configuration files
    mkdir -p "$DEPLOY_DIR/config"
    cp -r config/* "$DEPLOY_DIR/config/" 2>/dev/null || true
    
    # Copy scripts
    mkdir -p "$DEPLOY_DIR/scripts"
    cp scripts/*.sh "$DEPLOY_DIR/scripts/" 2>/dev/null || true
    
    # Set permissions
    chmod +x "$DEPLOY_DIR/server"
    chmod +x "$DEPLOY_DIR/release/executor"
    
    # Create logs directory
    mkdir -p "$DEPLOY_DIR/logs"
    
    print_success "Files deployed to: $DEPLOY_DIR"
}

# Function to create systemd service
create_systemd_service() {
    if [ "$SKIP_SERVICE" = true ]; then
        print_warning "Skipping systemd service creation"
        return 0
    fi
    
    print_status "Creating systemd service..."
    
    # Create user if it doesn't exist
    if ! id "$USER" >/dev/null 2>&1; then
        useradd -r -s /bin/false -d "$DEPLOY_DIR" "$USER"
        print_status "Created user: $USER"
    fi
    
    # Set ownership
    chown -R "$USER:$USER" "$DEPLOY_DIR"
    
    # Create systemd service file
    cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=CeesarCode Production Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_DIR
ExecStart=$DEPLOY_DIR/server
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DEPLOY_DIR/logs

# Resource limits
LimitNOFILE=65536
LimitNPROC=32768

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    print_success "Systemd service created: $SERVICE_NAME"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    # Build Docker image
    if [ -f "config/Dockerfile" ]; then
        docker build -f config/Dockerfile -t ceesarcode:latest .
        print_success "Docker image built"
    else
        print_error "Dockerfile not found: config/Dockerfile"
        exit 1
    fi
    
    # Stop existing container
    if docker ps -q -f name=ceesarcode >/dev/null 2>&1; then
        print_status "Stopping existing container..."
        docker stop ceesarcode
        docker rm ceesarcode
    fi
    
    # Run new container
    docker run -d \
        --name ceesarcode \
        --restart unless-stopped \
        -p "$PORT:8080" \
        -v "$DEPLOY_DIR/logs:/app/logs" \
        ceesarcode:latest
    
    print_success "Docker container deployed"
}

# Function to start service
start_service() {
    if [ "$DOCKER_MODE" = true ]; then
        print_status "Starting Docker container..."
        docker start ceesarcode
        print_success "Docker container started"
    else
        print_status "Starting systemd service..."
        systemctl start "$SERVICE_NAME"
        systemctl status "$SERVICE_NAME" --no-pager -l
        print_success "Systemd service started"
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Wait for service to start
    sleep 5
    
    # Test the deployment
    if curl -s --connect-timeout 10 "http://$HOST:$PORT/api/problems" >/dev/null; then
        print_success "Deployment verification passed"
        return 0
    else
        print_error "Deployment verification failed"
        return 1
    fi
}

# Function to show deployment summary
show_deployment_summary() {
    echo ""
    print_success "🎉 Production deployment completed!"
    echo ""
    echo -e "${CYAN}📊 Deployment Details:${NC}"
    echo "   • Host: $HOST"
    echo "   • Port: $PORT"
    echo "   • Deploy Directory: $DEPLOY_DIR"
    echo "   • User: $USER"
    echo "   • Service: $SERVICE_NAME"
    echo "   • Mode: $([ "$DOCKER_MODE" = true ] && echo "Docker" || echo "Systemd")"
    echo ""
    echo -e "${CYAN}🌐 Access Your App:${NC}"
    echo "   • URL: http://$HOST:$PORT"
    echo "   • API: http://$HOST:$PORT/api/problems"
    echo ""
    echo -e "${CYAN}🔧 Management Commands:${NC}"
    if [ "$DOCKER_MODE" = true ]; then
        echo "   • Stop: docker stop ceesarcode"
        echo "   • Start: docker start ceesarcode"
        echo "   • Logs: docker logs -f ceesarcode"
        echo "   • Restart: docker restart ceesarcode"
    else
        echo "   • Stop: systemctl stop $SERVICE_NAME"
        echo "   • Start: systemctl start $SERVICE_NAME"
        echo "   • Status: systemctl status $SERVICE_NAME"
        echo "   • Logs: journalctl -u $SERVICE_NAME -f"
        echo "   • Restart: systemctl restart $SERVICE_NAME"
    fi
    echo ""
    echo -e "${CYAN}📁 Files:${NC}"
    echo "   • Application: $DEPLOY_DIR"
    echo "   • Logs: $DEPLOY_DIR/logs"
    echo "   • Config: $DEPLOY_DIR/config"
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
    
    # Run deployment steps
    check_root
    check_prerequisites
    build_application
    test_application
    create_backup
    deploy_files
    
    if [ "$DOCKER_MODE" = true ]; then
        deploy_docker
    else
        create_systemd_service
    fi
    
    start_service
    
    if verify_deployment; then
        show_deployment_summary
        print_success "✅ Deployment successful! Your app is now running in production."
    else
        print_error "❌ Deployment verification failed. Check logs for details."
        exit 1
    fi
}

# Run main function
main "$@"
