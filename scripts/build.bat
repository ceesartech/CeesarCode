@echo off
REM CeesarCode Production Build Script for Windows
REM Compatible with Windows 10/11

echo 🚀 Building CeesarCode for Production...
echo =========================================

REM Check prerequisites
echo 📋 Checking prerequisites...

where go >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Go is not installed. Please install Go 1.19+ from https://golang.org/dl/
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js/npm is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Rust/Cargo is not installed. Please install Rust from https://rustup.rs/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Build Rust executor
echo 🔧 Building Rust executor...
cd executor-rs
cargo build --release

if %errorlevel% neq 0 (
    echo ❌ Rust build failed
    pause
    exit /b 1
)

echo ✅ Rust executor built successfully

REM Build Go backend
echo 🔧 Building Go backend...
cd ../backend
go mod tidy
go build -o ../bin/server.exe ./cmd/server

if %errorlevel% neq 0 (
    echo ❌ Go build failed
    pause
    exit /b 1
)

echo ✅ Go backend built successfully

REM Build React frontend
echo 🔧 Building React frontend...
cd ../frontend
call npm install

if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

call npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo ✅ React frontend built successfully

REM Create production directory structure
echo 📁 Creating production directory...
cd ..
if not exist dist mkdir dist
xcopy frontend\dist\* dist\ /E /I /H /Y
copy bin\server.exe dist\
xcopy executor-rs\target\release\* dist\ /E /I /H /Y
xcopy data dist\ /E /I /H /Y

echo ✅ Production build completed!
echo.
echo 🎉 Your CeesarCode production build is ready in the 'dist' directory!
echo.
echo To run in production:
echo 1. cd dist
echo 2. server.exe
echo 3. Open http://localhost:8080 in your browser
echo.
echo For Docker deployment:
echo docker build -t ceesarcode .
echo docker run -p 8080:8080 ceesarcode

pause
