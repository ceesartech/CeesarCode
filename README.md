# CeesarCode — Unified Multi-Language Coding Judge

> An end-to-end, LeetCode/CodeSignal-style coding judge you can run locally or in production (Docker or Firecracker). Features AI-powered question generation, pair programming assistant, and comprehensive web research.

## 🚀 Quick Start

```bash
# Development mode
./scripts/start-dev.sh

# Gamma (pre-production) mode
./scripts/build-gamma.sh && ./scripts/start-gamma.sh

# Production mode
./scripts/build-prod.sh && ./scripts/start-prod.sh
```

Visit `http://localhost:5173` (dev) or `http://localhost:8080` (prod/gamma)

## 🌟 What's New

### AI Pair Programming Agent
An intelligent coding assistant that helps you:
- **Write Code**: Get implementation suggestions for algorithms and features
- **Review Code**: Receive feedback on code quality and best practices
- **Debug**: Identify and fix bugs with AI-powered analysis
- **System Design**: Discuss architecture, tradeoffs, and scalability

### Gamma Environment
A pre-production environment for testing:
- Mirrors production configuration
- Runs on low-cost cloud infrastructure
- Perfect for integration testing and demos

### Modern UI with Chakra UI
- Updated component library for consistency
- Improved dark/light mode support
- Better accessibility

## 📚 Documentation

### Quick Links

- **[Getting Started Guide](./docs/README.md#quick-start)** - Setup and installation
- **[Features Overview](./docs/FEATURES.md)** - Complete feature list
- **[Project Structure](./docs/PROJECT_STRUCTURE.md)** - Directory organization
- **[Production Deployment](./docs/PRODUCTION_DEPLOYMENT.md)** - Deployment guide

### Core Components

- **[Backend API](./docs/BACKEND_API.md)** - Complete API documentation
- **[Frontend UI](./docs/UI-OVERVIEW.md)** - UI components and features
- **[AI Question Generation](./docs/AI_QUESTION_GENERATION.md)** - AI-powered question generation
- **[Pair Programming Agent](./docs/PAIR-AGENT.md)** - AI pair programming & system design

### Environment & Deployment

- **[Gamma Architecture](./docs/ARCHITECTURE-GAMMA.md)** - Pre-production environment guide
- **[Language Setup](./docs/LANGUAGE_SETUP.md)** - Install programming languages
- **[AI Setup](./docs/AI_SETUP.md)** - Configure AI providers

## ✨ Key Features

- **🤝 AI Pair Programming** - Interactive coding assistant (Gemini/OpenAI/Claude)
- **📐 System Design Partner** - Architecture discussions and tradeoff analysis
- **💻 Professional Code Editor** - Monaco Editor with IntelliSense and autocomplete
- **🖥️ Terminal Output** - xterm.js terminal emulator with ANSI color support
- **🤖 AI Question Generator** - Generate unique interview questions with web research
- **🌐 Comprehensive Web Search** - 12 concurrent searches for detailed position information
- **💻 Multi-Language Support** - 14+ programming languages
- **🎯 Real Code Execution** - Actual compilation and execution in sandboxed environments
- **📝 Custom Problem Creation** - Create your own problems via UI
- **📊 Test Case Management** - View, edit, and manage test cases
- **📁 File Upload System** - Upload datasets for ML/Data Science
- **📓 Jupyter Mode** - Interactive cell-based coding with Python
- **🌙 Dark Mode** - Beautiful dark/light theme support
- **📐 Optimized Layout** - Full browser window utilization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Monaco    │  │  xterm.js   │  │  Excalidraw │  │
│  │   Editor    │  │  Terminal   │  │  Canvas     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                   Backend (Go)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Problem   │  │     AI      │  │    Pair     │  │
│  │   Manager   │  │  Generator  │  │   Agent     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  Executor (Rust)│         │  AI Providers   │
│  Docker/FC      │         │  Gemini/OpenAI  │
└─────────────────┘         │  Claude         │
                            └─────────────────┘
```

## 🔧 Three-Environment Model

| Environment | Purpose | Start Command |
|------------|---------|---------------|
| **Dev** | Local development | `./scripts/start-dev.sh` |
| **Gamma** | Pre-production testing | `./scripts/start-gamma.sh` |
| **Prod** | Production | `./scripts/start-prod.sh` |

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Chakra UI, Monaco Editor, xterm.js
- **Backend**: Go 1.22+
- **Executor**: Rust (sandboxed code execution)
- **AI Providers**: Google Gemini, OpenAI GPT, Anthropic Claude
- **Languages**: Python, C++, Java, JavaScript, TypeScript, Go, Rust, and more
- **Editor**: Monaco Editor (same as VS Code)
- **Terminal**: xterm.js (professional terminal emulator)

## 🤖 AI Configuration

Set up AI providers for question generation and pair programming:

```bash
# Option 1: Use setup script
./scripts/setup-ai.sh

# Option 2: Set environment variables
export GEMINI_API_KEY="your-key"    # Free tier available
export OPENAI_API_KEY="your-key"    # GPT-4o-mini
export ANTHROPIC_API_KEY="your-key" # Claude 3.5
```

## 📦 Installation

```bash
# Prerequisites: Go 1.22+, Node.js 20+, Rust

# 1. Clone the repository
git clone https://github.com/ceesartech/CeesarCode.git
cd CeesarCode

# 2. Start development mode
./scripts/start-dev.sh

# 3. Open http://localhost:5173
```

See [docs/README.md](./docs/README.md) for detailed installation instructions.

## 🤝 Contributing

Contributions welcome! Please read the documentation first to understand the architecture.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in gamma environment
5. Submit a pull request

## 📄 License

No License

---

For detailed information, see the [Documentation Index](./docs/README.md).
