#!/bin/bash

# CeesarCode Production Test Script
# This script tests the production server functionality

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
    echo -e "${PURPLE}🧪 CeesarCode Production Test${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Default configuration
DEFAULT_HOST="localhost"
DEFAULT_PORT=8080
DEFAULT_TIMEOUT=10

# Parse command line arguments
HOST=$DEFAULT_HOST
PORT=$DEFAULT_PORT
TIMEOUT=$DEFAULT_TIMEOUT
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            HOST="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -h, --host HOST      Server host (default: $DEFAULT_HOST)"
            echo "  -p, --port PORT      Server port (default: $DEFAULT_PORT)"
            echo "  -t, --timeout SEC    Request timeout (default: $DEFAULT_TIMEOUT)"
            echo "  -v, --verbose        Verbose output"
            echo "  --help               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Test localhost:8080"
            echo "  $0 -h 192.168.1.100 -p 3000 # Test specific host/port"
            echo "  $0 -v                       # Verbose output"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Server URL
SERVER_URL="http://$HOST:$PORT"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to make HTTP request
make_request() {
    local url=$1
    local method=${2:-GET}
    local data=$3
    local expected_status=${4:-200}
    
    if [ "$VERBOSE" = true ]; then
        print_status "Making $method request to: $url"
    fi
    
    local response
    local status_code
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            --connect-timeout $TIMEOUT \
            --max-time $TIMEOUT \
            "$url")
    else
        response=$(curl -s -w "\n%{http_code}" \
            --connect-timeout $TIMEOUT \
            --max-time $TIMEOUT \
            "$url")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "$method $url -> $status_code"
        if [ "$VERBOSE" = true ]; then
            echo "Response: $response_body"
        fi
        return 0
    else
        print_error "$method $url -> $status_code (expected $expected_status)"
        if [ "$VERBOSE" = true ]; then
            echo "Response: $response_body"
        fi
        return 1
    fi
}

# Function to test server connectivity
test_connectivity() {
    print_status "Testing server connectivity..."
    
    if ! command_exists curl; then
        print_error "curl is required for testing but not installed"
        exit 1
    fi
    
    # Test basic connectivity
    if make_request "$SERVER_URL" "GET" "" "200"; then
        print_success "Server is responding"
        return 0
    else
        print_error "Server is not responding"
        print_status "Make sure the server is running before testing"
        print_status "Start server with: ./scripts/start-prod.sh"
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoints() {
    print_status "Testing API endpoints..."
    
    local tests_passed=0
    local tests_total=0
    
    # Test problems list endpoint
    tests_total=$((tests_total + 1))
    if make_request "$SERVER_URL/api/problems" "GET" "" "200"; then
        tests_passed=$((tests_passed + 1))
    fi
    
    # Test specific problem endpoint
    tests_total=$((tests_total + 1))
    if make_request "$SERVER_URL/api/problem/float-mean" "GET" "" "200"; then
        tests_passed=$((tests_passed + 1))
    fi
    
    # Test code submission endpoint
    tests_total=$((tests_total + 1))
    local submission_data='{
        "ProblemID": "float-mean",
        "Language": "python",
        "Files": {
            "main.py": "n=int(input())\nvals=list(map(float,input().split()))\nprint(f\"{sum(vals)/n:.1f}\")"
        }
    }'
    if make_request "$SERVER_URL/api/submit" "POST" "$submission_data" "200"; then
        tests_passed=$((tests_passed + 1))
    fi
    
    # Test 404 endpoint
    tests_total=$((tests_total + 1))
    if make_request "$SERVER_URL/api/nonexistent" "GET" "" "404"; then
        tests_passed=$((tests_passed + 1))
    fi
    
    print_status "API Tests: $tests_passed/$tests_total passed"
    
    if [ $tests_passed -eq $tests_total ]; then
        print_success "All API tests passed"
        return 0
    else
        print_error "Some API tests failed"
        return 1
    fi
}

# Function to test frontend assets
test_frontend_assets() {
    print_status "Testing frontend assets..."
    
    local tests_passed=0
    local tests_total=0
    
    # Test main HTML file
    tests_total=$((tests_total + 1))
    if make_request "$SERVER_URL/" "GET" "" "200"; then
        tests_passed=$((tests_passed + 1))
    fi
    
    # Test if HTML contains expected content
    tests_total=$((tests_total + 1))
    local html_response=$(curl -s --connect-timeout $TIMEOUT --max-time $TIMEOUT "$SERVER_URL/")
    if echo "$html_response" | grep -q "CeesarCode\|React\|Vite"; then
        print_success "Frontend HTML contains expected content"
        tests_passed=$((tests_passed + 1))
    else
        print_error "Frontend HTML missing expected content"
    fi
    
    print_status "Frontend Tests: $tests_passed/$tests_total passed"
    
    if [ $tests_passed -eq $tests_total ]; then
        print_success "All frontend tests passed"
        return 0
    else
        print_error "Some frontend tests failed"
        return 1
    fi
}

# Function to test performance
test_performance() {
    print_status "Testing basic performance..."
    
    local start_time=$(date +%s%N)
    local response=$(curl -s --connect-timeout $TIMEOUT --max-time $TIMEOUT "$SERVER_URL/api/problems")
    local end_time=$(date +%s%N)
    
    local duration_ms=$(( (end_time - start_time) / 1000000 ))
    
    if [ $duration_ms -lt 1000 ]; then
        print_success "API response time: ${duration_ms}ms (excellent)"
    elif [ $duration_ms -lt 3000 ]; then
        print_success "API response time: ${duration_ms}ms (good)"
    elif [ $duration_ms -lt 5000 ]; then
        print_warning "API response time: ${duration_ms}ms (acceptable)"
    else
        print_error "API response time: ${duration_ms}ms (slow)"
    fi
}

# Function to show test summary
show_test_summary() {
    echo ""
    print_success "🎉 Production test completed!"
    echo ""
    echo -e "${CYAN}📊 Test Results:${NC}"
    echo "   • Server URL: $SERVER_URL"
    echo "   • Host: $HOST"
    echo "   • Port: $PORT"
    echo "   • Timeout: ${TIMEOUT}s"
    echo ""
    echo -e "${CYAN}🌐 Access Your App:${NC}"
    echo "   • Frontend: $SERVER_URL"
    echo "   • API: $SERVER_URL/api/problems"
    echo ""
    echo -e "${CYAN}🔧 Management:${NC}"
    echo "   • Stop server: ./scripts/stop-prod.sh"
    echo "   • View logs: tail -f logs/production.log"
    echo "   • Restart: ./scripts/stop-prod.sh && ./scripts/start-prod.sh"
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
    
    # Run tests
    local all_tests_passed=true
    
    if ! test_connectivity; then
        all_tests_passed=false
    fi
    
    if ! test_api_endpoints; then
        all_tests_passed=false
    fi
    
    if ! test_frontend_assets; then
        all_tests_passed=false
    fi
    
    test_performance
    
    show_test_summary
    
    if [ "$all_tests_passed" = true ]; then
        print_success "✅ All tests passed! Production server is working correctly."
        exit 0
    else
        print_error "❌ Some tests failed. Check the server logs for details."
        exit 1
    fi
}

# Run main function
main "$@"
