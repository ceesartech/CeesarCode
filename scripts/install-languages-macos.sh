#!/bin/bash

# CeesarCode Language Installation Script for macOS
# This script installs all required language compilers and runtimes

echo "🚀 Installing CeesarCode Language Support for macOS..."
echo "=================================================="

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed. Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew is already installed"
fi

# Update Homebrew
echo "🔄 Updating Homebrew..."
brew update

# Install Node.js (for JavaScript and TypeScript)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
else
    echo "✅ Node.js is already installed"
fi

# Install TypeScript compiler
if ! command -v tsc &> /dev/null; then
    echo "📦 Installing TypeScript compiler..."
    npm install -g typescript
else
    echo "✅ TypeScript is already installed"
fi

# Install Python 3
if ! command -v python3 &> /dev/null; then
    echo "📦 Installing Python 3..."
    brew install python@3.12
else
    echo "✅ Python 3 is already installed"
fi

# Install Go
if ! command -v go &> /dev/null; then
    echo "📦 Installing Go..."
    brew install go
else
    echo "✅ Go is already installed"
fi

# Install Rust
if ! command -v rustc &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
else
    echo "✅ Rust is already installed"
fi

# Install Java (required for Kotlin and Scala)
if ! command -v javac &> /dev/null; then
    echo "📦 Installing Java Development Kit..."
    brew install openjdk@17
    # Add to PATH
    echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
else
    echo "✅ Java is already installed"
fi

# Install Scala
if ! command -v scalac &> /dev/null; then
    echo "📦 Installing Scala..."
    brew install scala
else
    echo "✅ Scala is already installed"
fi

# Install Kotlin
if ! command -v kotlinc &> /dev/null; then
    echo "📦 Installing Kotlin..."
    brew install kotlin
else
    echo "✅ Kotlin is already installed"
fi

# Ruby is usually pre-installed on macOS, but let's make sure we have a recent version
if ! command -v ruby &> /dev/null; then
    echo "📦 Installing Ruby..."
    brew install ruby
else
    echo "✅ Ruby is already installed"
fi

# Swift is pre-installed on macOS with Xcode Command Line Tools
if ! command -v swift &> /dev/null; then
    echo "📦 Installing Xcode Command Line Tools (for Swift)..."
    xcode-select --install
else
    echo "✅ Swift is already installed"
fi

# C/C++ compilers are usually available with Xcode Command Line Tools
if ! command -v gcc &> /dev/null; then
    echo "📦 Installing Xcode Command Line Tools (for C/C++)..."
    xcode-select --install
else
    echo "✅ C/C++ compilers are already installed"
fi

echo ""
echo "🎉 Installation Complete!"
echo "========================"
echo ""
echo "Installed Languages and Versions:"
echo "----------------------------------"

# Check versions of all installed languages
echo "Python: $(python3 --version 2>/dev/null || echo 'Not found')"
echo "Node.js: $(node --version 2>/dev/null || echo 'Not found')"
echo "TypeScript: $(tsc --version 2>/dev/null || echo 'Not found')"
echo "Go: $(go version 2>/dev/null || echo 'Not found')"
echo "Rust: $(rustc --version 2>/dev/null || echo 'Not found')"
echo "Java: $(javac -version 2>&1 | head -1 || echo 'Not found')"
echo "Scala: $(scalac -version 2>&1 | head -1 || echo 'Not found')"
echo "Kotlin: $(kotlinc -version 2>/dev/null || echo 'Not found')"
echo "Ruby: $(ruby --version 2>/dev/null || echo 'Not found')"
echo "Swift: $(swift --version 2>/dev/null | head -1 || echo 'Not found')"
echo "GCC: $(gcc --version 2>/dev/null | head -1 || echo 'Not found')"
echo "G++: $(g++ --version 2>/dev/null | head -1 || echo 'Not found')"

echo ""
echo "🚀 All languages are now ready for CeesarCode!"
echo "You may need to restart your terminal or run 'source ~/.zshrc' for PATH changes to take effect."
