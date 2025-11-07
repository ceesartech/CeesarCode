#!/bin/bash

# CeesarCode Quick Start Script
# Simple wrapper for the complete production pipeline

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 CeesarCode Quick Start${NC}"
echo -e "${PURPLE}========================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "src" ]; then
    echo -e "${RED}❌ Please run this script from the CeesarCode root directory${NC}"
    exit 1
fi

# Show options
echo -e "${CYAN}Choose your deployment mode:${NC}"
echo ""
echo "1. 🏠 Local Development (build + test + start locally)"
echo "2. 🚀 Production Deployment (build + test + deploy to system)"
echo "3. 🐳 Docker Deployment (build + test + deploy with Docker)"
echo "4. 🧪 Test Only (build + test, no deployment)"
echo "5. 📋 Show all options"
echo ""

# Read user choice
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}🏠 Starting local development mode...${NC}"
        ./scripts/run-prod.sh --local
        ;;
    2)
        echo -e "${GREEN}🚀 Starting production deployment...${NC}"
        sudo ./scripts/run-prod.sh
        ;;
    3)
        echo -e "${GREEN}🐳 Starting Docker deployment...${NC}"
        sudo ./scripts/run-prod.sh --docker
        ;;
    4)
        echo -e "${GREEN}🧪 Running tests only...${NC}"
        ./scripts/run-prod.sh --skip-deploy
        ;;
    5)
        echo -e "${CYAN}📋 All available options:${NC}"
        echo ""
        echo "Local Development:"
        echo "  ./scripts/run-prod.sh --local"
        echo ""
        echo "Production Deployment:"
        echo "  sudo ./scripts/run-prod.sh"
        echo "  sudo ./scripts/run-prod.sh -p 3000 -d /var/www/ceesarcode"
        echo ""
        echo "Docker Deployment:"
        echo "  sudo ./scripts/run-prod.sh --docker"
        echo "  sudo ./scripts/run-prod.sh --docker -p 8080"
        echo ""
        echo "Testing Only:"
        echo "  ./scripts/run-prod.sh --skip-deploy"
        echo "  ./scripts/run-prod.sh --skip-build --skip-deploy"
        echo ""
        echo "Custom Configuration:"
        echo "  sudo ./scripts/run-prod.sh -p 3000 -h 127.0.0.1 -d /opt/myapp"
        echo ""
        echo "Force Operations:"
        echo "  sudo ./scripts/run-prod.sh --force"
        echo "  sudo ./scripts/run-prod.sh --docker --force"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac
