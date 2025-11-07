#!/bin/bash

# CeesarCode Production Build Script
# Compatible with macOS, Linux, and Windows (via Git Bash/Cygwin)

set -e

echo "🚀 Building CeesarCode for Production..."
echo "========================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists go; then
    echo "❌ Go is not installed. Please install Go 1.19+ from https://golang.org/dl/"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Node.js/npm is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command_exists cargo; then
    echo "❌ Rust/Cargo is not installed. Please install Rust from https://rustup.rs/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Build Rust executor
echo "🔧 Building Rust executor..."
cd src/executor
cargo build --release

if [ $? -ne 0 ]; then
    echo "❌ Rust build failed"
    exit 1
fi

cd ../..
echo "✅ Rust executor built successfully"

# Build Go backend
echo "🔧 Building Go backend..."
cd src/backend
go mod tidy
go build -o ../../bin/server .

if [ $? -ne 0 ]; then
    echo "❌ Go build failed"
    exit 1
fi

cd ../..
echo "✅ Go backend built successfully"

# Build React frontend
echo "🔧 Building React frontend..."
cd src/frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ React frontend built successfully"

# Create production directory structure
echo "📁 Creating production directory..."
cd ../..
mkdir -p dist
cp -r src/frontend/dist/* dist/
cp bin/server dist/
cp -r src/executor/target/release dist/
cp -r data dist/

echo "✅ Production build completed!"
echo ""
echo "🎉 Your CeesarCode production build is ready in the 'dist' directory!"
echo ""
echo "To run in production:"
echo "1. cd dist"
echo "2. ./server (Linux/macOS) or server.exe (Windows)"
echo "3. Open http://localhost:8080 in your browser"
echo ""
echo "For Docker deployment:"
echo "docker build -t ceesarcode ."
echo "docker run -p 8080:8080 ceesarcode"
