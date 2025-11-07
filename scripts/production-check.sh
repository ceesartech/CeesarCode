#!/bin/bash

# CeesarCode Production Readiness Check
# Verifies that all components are ready for production deployment

echo "🔍 CeesarCode Production Readiness Check"
echo "========================================"
echo ""

# Check if all required binaries exist
echo "📦 Checking Binary Components..."
echo "--------------------------------"

check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo "✅ $description: $file"
        return 0
    else
        echo "❌ $description: $file (MISSING)"
        return 1
    fi
}

BINARY_ISSUES=0

check_file "bin/server" "Backend Server" || ((BINARY_ISSUES++))
check_file "executor-rs/target/release/executor" "Rust Executor" || ((BINARY_ISSUES++))
check_file "dist/release/executor" "Production Executor" || ((BINARY_ISSUES++))
check_file "dist/index.html" "Frontend Build" || ((BINARY_ISSUES++))
check_file "frontend/dist/index.html" "Frontend Source Build" || ((BINARY_ISSUES++))

echo ""
echo "🌐 Checking Language Runtimes..."
echo "--------------------------------"

check_command() {
    local cmd=$1
    local description=$2
    
    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -1 || echo "Version unknown")
        echo "✅ $description: $version"
        return 0
    else
        echo "❌ $description: $cmd (NOT INSTALLED)"
        return 1
    fi
}

LANGUAGE_ISSUES=0

check_command "python3" "Python" || ((LANGUAGE_ISSUES++))
check_command "node" "JavaScript/Node.js" || ((LANGUAGE_ISSUES++))
check_command "g++" "C++ Compiler" || ((LANGUAGE_ISSUES++))
check_command "gcc" "C Compiler" || ((LANGUAGE_ISSUES++))
check_command "javac" "Java Compiler" || ((LANGUAGE_ISSUES++))
check_command "java" "Java Runtime" || ((LANGUAGE_ISSUES++))
check_command "go" "Go" || ((LANGUAGE_ISSUES++))
check_command "rustc" "Rust Compiler" || ((LANGUAGE_ISSUES++))
check_command "ruby" "Ruby" || ((LANGUAGE_ISSUES++))
check_command "swift" "Swift" || ((LANGUAGE_ISSUES++))
check_command "kotlinc" "Kotlin Compiler" || ((LANGUAGE_ISSUES++))
check_command "scala" "Scala" || ((LANGUAGE_ISSUES++))

echo ""
echo "📁 Checking Data Structure..."
echo "-----------------------------"

DATA_ISSUES=0

check_file "data/problems/float-mean/manifest.json" "Float-Mean Problem" || ((DATA_ISSUES++))
check_file "data/problems/float-mean/v1/public/01.in" "Test Input" || ((DATA_ISSUES++))
check_file "data/problems/float-mean/v1/public/01.out" "Test Output" || ((DATA_ISSUES++))

echo ""
echo "📊 Production Readiness Summary"
echo "==============================="
if [ $BINARY_ISSUES -eq 0 ]; then
    echo "Binary Components: ✅ READY"
else
    echo "Binary Components: ❌ ISSUES ($BINARY_ISSUES)"
fi

if [ $LANGUAGE_ISSUES -eq 0 ]; then
    echo "Language Runtimes: ✅ READY"
else
    echo "Language Runtimes: ❌ ISSUES ($LANGUAGE_ISSUES)"
fi

if [ $DATA_ISSUES -eq 0 ]; then
    echo "Data Structure: ✅ READY"
else
    echo "Data Structure: ❌ ISSUES ($DATA_ISSUES)"
fi

TOTAL_ISSUES=$((BINARY_ISSUES + LANGUAGE_ISSUES + DATA_ISSUES))

echo ""
if [ $TOTAL_ISSUES -eq 0 ]; then
    echo "🎉 PRODUCTION READY!"
    echo "==================="
    echo "✅ All components verified"
    echo "✅ All languages installed"
    echo "✅ All data structures present"
    echo ""
    echo "🚀 Ready to deploy!"
    echo ""
    echo "Start the server:"
    echo "  ./bin/server"
    echo ""
    echo "Or use Docker:"
    echo "  docker-compose -f docker-compose.full-languages.yml up -d"
    echo ""
    echo "Then run language verification:"
    echo "  ./verify-all-languages.sh"
else
    echo "⚠️  PRODUCTION NOT READY"
    echo "========================"
    echo "❌ Total issues found: $TOTAL_ISSUES"
    echo ""
    echo "🔧 To fix:"
    echo "1. Run: ./install-languages-macos.sh (macOS)"
    echo "2. Build binaries: ./build.sh"
    echo "3. Re-run this check: ./production-check.sh"
fi

echo ""
echo "✨ Production check complete!"
