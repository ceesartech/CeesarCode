
# CeesarCode — Unified Multi‑Language Judge
> An end‑to‑end, LeetCode/CodeSignal‑style coding judge you can run locally or in prod (Docker or Firecracker).

## 📚 Documentation Index

### Core Component Documentation
- **[Backend API](./BACKEND_API.md)** - Complete REST API documentation, endpoints, request/response formats, code execution flow, and error handling
- **[Frontend UI](./FRONTEND_UI.md)** - React application architecture, UI components, state management, code editor, and theming system
- **[AI Question Generation](./AI_QUESTION_GENERATION.md)** - Complete AI system documentation including setup, provider integration (Gemini/OpenAI/Claude), web search feature (12 concurrent searches), prompt engineering, response parsing, and troubleshooting

### Setup & Configuration Guides
- **[Language Setup](./LANGUAGE_SETUP.md)** - Complete language installation guide, configuration, performance benchmarks, and troubleshooting for all 14+ supported programming languages
- **[Production Deployment](./PRODUCTION_DEPLOYMENT.md)** - Complete production deployment guide including Docker setup, Firecracker configuration, production checklist, verification, and system requirements

### Project Information
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Detailed directory structure, file organization, and component locations
- **[Features](./FEATURES.md)** - Complete feature list with descriptions
- **[Changelog](./CHANGELOG.md)** - Version history and updates


---

## 📋 Table of Contents
- [Documentation Index](#-documentation-index)
- [Quick Start](#-quickstart-2-3-minutes-demo-mode)
- [Features](#-ui-features)
- [API Key Configuration](#api-key-configuration)
- [Production Deployment](#-production-deployment)
- [Architecture](#️-architecture-high-level)
- [Recent Updates](#-recent-updates--fixes)
- [Troubleshooting](#-troubleshooting)

---

## 🔭 What you get

- **Frontend (React + Vite)** — Production-grade UI with grey/off-white theme, dark mode toggle, problem selection, code editor, execution results with clear functionality, and comprehensive error handling.
- **Backend (Go)** — REST API for problems management, code submission, custom problem creation, and test case management with robust error handling.
- **Executor (Rust)** — *two options*:
  - **Demo stub (included here):** works out of the box to prove the pipeline without sandbox deps.
  - **Real execution (now implemented):** Actually runs and validates user code against test cases with proper compilation and execution.
- **Real Code Execution** — Supports 14 programming languages with compilation, execution, and output validation.
- **Custom Problem Creation** — UI-driven problem creation with automatic directory structure, manifest generation, and test case setup.
- **Multi-Language Support** — 14 programming languages: Python, C++, C, Java, Kotlin, Scala, Go, Rust, Swift, Ruby, JavaScript, TypeScript, Bash, Shell, SQL.
- **Jupyter Notebook Mode** — Interactive coding environment with cell-based execution and output display.
- **Test Case Management** — View, edit, and manage test cases directly from the UI for custom problems.
- **File Upload System** — Upload datasets and files for ML/Data Science problems with proper handling.
- **Cross-Platform** — Works on Windows, Mac, and Linux with proper path handling and dependencies.
- **Problem bundles** — examples for Python/C++ (`float-mean`), Shell (`shell-hello`), SQL (`top-customers-sql`), and ML (`ml-iris-classification`).
- **🤖 AI Question Generator** — Generate unique, contextual coding interview questions based on company, role, and experience level using Google Gemini, OpenAI, or Claude AI.
- **🔍 Comprehensive Web Search** — Automatically performs 12 concurrent web searches to gather detailed information about positions, interview questions, technical requirements, and company-specific details to generate highly accurate questions.

> ✅ **NEW:** Real code execution is now implemented! The executor actually compiles and runs user code, validates outputs against test cases, and provides detailed results including execution time and error messages.
> ✅ **NEW:** AI Question Generator with Web Research! Automatically searches the web for comprehensive position information (interview questions, technical requirements, technologies, interview process) and uses this data to generate highly accurate, contextually relevant questions.

---

## 🎨 UI Features

### **Core Interface**
- **Dark/Light Mode Toggle** — Switch between themes with one click
- **Problem Sidebar** — Clean list of available coding problems (collapsible, resizable)
- **Code Editor** — Full-featured editor with:
  - **Line Numbers** — Numbered lines for easy code navigation
  - **Synchronized Scrolling** — Line numbers scroll with code
  - **Syntax Highlighting** — Modern monospace font support
  - **Resizable Layout** — Adjustable problem statement and code editor panes
- **Language Selection** — 14 programming languages supported
- **Browser Navigation** — Back, Forward, and Refresh buttons for seamless navigation
- **Real-time Execution** — Run code and see immediate results with console output
- **Console Output** — Terminal-like output display (collapsible, resizable)

### **Code Execution**
- **Run Code** — Test your code against a single test case for quick validation
- **Submit Code** — Test your code against all test cases for final submission
- **Execution Modes**:
  - **IDE Mode**: Traditional single-file coding
  - **Jupyter Mode**: Interactive cell-based coding with data upload support

### **Advanced Features**
- **🤖 AI Question Generator with Web Research** — Generate unique, contextual coding interview questions:
  - **Comprehensive Web Research** — Automatically performs 12 concurrent searches for:
    - Actual interview questions asked at the company
    - Required technologies, frameworks, and tools
    - Technical requirements and skills
    - Interview process and format
    - Company-specific expectations
  - **Company-specific** — Netflix streaming, Uber routing, Google data processing
  - **Role-specific** — Backend orchestration, Frontend optimization, Data engineering
  - **Level-appropriate** — Junior vs Senior complexity
  - **Varied problem types** — Algorithms, system design, debugging, etc.
  - **Multiple AI Providers** — Google Gemini (free tier), OpenAI GPT, Anthropic Claude
  - **Intelligent Prompting** — Uses web research to create highly accurate, relevant questions
- **Jupyter Notebook Mode** — Interactive cell-based coding with enhanced features:
  - Run individual cells
  - Run all cells sequentially
  - Clear all outputs
  - Cell dependency support
  - Multi-language support (Python, Scala, JavaScript)
  - **Upload Data button** — Upload datasets directly in Jupyter mode
- **Custom Problem Creation** — Create your own coding problems via UI with multiple test cases
- **Bulk Question Upload** — Upload multiple questions from JSON file format
- **Test Case Management** — View, edit, add, and manage test cases for custom problems
  - Reset to original test cases
  - Add single test case
  - **Add multiple test cases** — Add 1-20 test cases at once
  - Individual test case deletion
- **File Upload System** — Upload datasets for ML/Data Science problems
  - **Upload Data** — Local file upload for specific problems
  - **Upload Questions** — JSON file upload for multiple problems
- **Result Analysis** — Detailed execution results with pass/fail indicators, execution time, and error messages
- **Error Handling** — Comprehensive error display and debugging with safety mechanisms

### **User Experience**
- **Responsive Design** — Works on desktop and mobile devices
- **Keyboard Shortcuts** — Ctrl/Cmd + Enter to run code
- **Browser Navigation** — Enhanced back/forward button support with proper state management
- **Loading States** — Visual feedback during operations
- **Connection Status** — Real-time backend connectivity indicator
- **Auto-clear Results** — Results automatically clear when switching questions
- **Enhanced Test Cases** — Fixed field mapping and display issues

---

## 🗺️ Architecture (high‑level)

```mermaid
flowchart LR
  UI[React UI] -->|POST /api/submit| API(Go Backend)
  API -->|stdin job.json| EXE[Rust Executor]

  subgraph Sandbox
    direction LR
    DKR[Docker Container]
    FC[Firecracker microVM]
  end

  EXE -- optional --> DKR
  EXE -- optional --> FC
  DKR -->|writes /workspace/result.json| EXE
  FC  -->|writes /workspace/result.json| EXE
  EXE --> API --> UI

  classDef gray fill:#f2f2f2,stroke:#999,stroke-width:1px,color:#333
  class DKR,FC gray;
```

**Data paths**
- Problem assets → mounted read‑only inside the sandbox/VM.
- Candidate code → mounted read‑write to capture `result.json`.

**Result contract**
```json
{
  "verdict": "Accepted|Rejected|Error",
  "tests": [
    {
      "name": "01",
      "status": "AC|WA|RE|IE",
      "time_ms": 38,
      "message": "Expected: '2.0', Got: '3.0'" // or empty for AC
    }
  ]
}
```

**Status codes:**
- **AC**: Accepted (output matches expected)
- **WA**: Wrong Answer (output doesn't match)
- **RE**: Runtime Error (compilation/execution failed)
- **IE**: Internal Error (missing test files, etc.)

**Verdict:**
- **Accepted**: All tests passed
- **Rejected**: At least one test failed
- **Error**: Internal error or missing test cases

---

## 📁 Repository layout

```
CeesarCode/
├── src/                          # Source code
│   ├── backend/                  # Go backend server
│   │   ├── cmd/server/main.go    # Alternative server entry point
│   │   ├── go.mod                # Go module definition
│   │   ├── go.sum                # Go module checksums
│   │   └── main.go               # Main server entry point
│   ├── frontend/                 # React frontend
│   │   ├── src/App.jsx           # Main React component
│   │   ├── src/main.jsx          # React entry point
│   │   ├── package.json          # Node.js dependencies
│   │   ├── vite.config.js        # Vite build configuration
│   │   └── dist/                 # Built frontend assets
│   └── executor/                 # Rust code executor
│       ├── src/main.rs           # Executor implementation
│       ├── Cargo.toml            # Rust dependencies
│       └── target/               # Compiled Rust binaries
├── docs/                         # Documentation
│   ├── README.md                 # This file
│   ├── PROJECT_STRUCTURE.md      # Detailed project structure
│   ├── LANGUAGE_SETUP.md         # Language installation guide
│   ├── PRODUCTION_DEPLOYMENT.md  # Production deployment guide
│   └── sample-questions.json     # Sample problem data
├── scripts/                      # Build and utility scripts
│   ├── build.sh                  # Main build script
│   ├── build.bat                 # Windows build script
│   ├── install-languages-macos.sh # macOS language installation
│   └── verify-all-languages.sh   # Language verification script
├── config/                       # Configuration files
│   ├── docker-compose.yml        # Docker Compose configuration
│   ├── Dockerfile                # Docker configuration
│   └── .dockerignore             # Docker ignore patterns
├── data/problems/                # Problem definitions
│   ├── float-mean/               # Python/C++ sample problem
│   │   ├── manifest.json         # Problem metadata & supported languages
│   │   └── v1/public/            # Test cases
│   │      ├── 01.in              # Input file
│   │      └── 01.out             # Expected output
│   ├── shell-hello/              # Shell scripting example
│   ├── top-customers-sql/        # SQL sample
│   └── ml-iris-classification/   # ML/Data Science example
├── tests/                        # Test files and logs
├── dist/                         # Production build output
└── bin/                          # Compiled binaries
```

---

## 🚀 Quickstart (2–3 minutes, demo mode)

This runs the whole flow **without Docker/Firecracker** using the minimal executor stub.

### Prerequisites
- **Go 1.22+** (works on Windows, Mac, Linux)
- **Node.js 18+** (works on Windows, Mac, Linux)
- **npm** or **yarn**
- **Python 3.8+** (for Python code execution)
- **Optional**: Gemini API key for AI question generation

### Quick Start (Recommended)

**Option 1: Using Start Scripts (Easiest)**

```bash
# Development mode (with optional API key)
./scripts/start-dev.sh [YOUR_GEMINI_API_KEY]

# Or without API key (AI agent will use fallback templates)
./scripts/start-dev.sh
```

This will:
- Start the backend server on `http://localhost:8080`
- Start the frontend dev server on `http://localhost:5173`
- Automatically load API key from `.env` file if no argument provided
- Show colored status messages and logs

**Option 2: Manual Setup**

1) **Backend (Go 1.22+)**
```bash
cd src/backend
# With API key
GEMINI_API_KEY=YOUR_API_KEY go run cmd/server/main.go

# Or without API key
go run cmd/server/main.go
# → listens on http://localhost:8080
```

2) **Frontend (Node 18+)**
```bash
cd src/frontend
npm install
npm run dev
# → http://localhost:5173 (proxies /api to :8080)
```

3) **Open the Application**
   - Visit **http://localhost:5173** in your browser
   - The app works on **Windows**, **Mac**, and **Linux**

### Production Mode

**Option 1: Using Production Start Script**

```bash
# Build first
./scripts/build-prod.sh

# Start production server
./scripts/start-prod.sh [OPTIONS] [GEMINI_API_KEY]

# Examples:
./scripts/start-prod.sh                          # Default port 8080
./scripts/start-prod.sh -k YOUR_API_KEY          # With API key
./scripts/start-prod.sh -p 3000 -d               # Port 3000 as daemon
./scripts/start-prod.sh -p 9000 -k YOUR_API_KEY -d  # Port 9000 with API key as daemon
```

**Option 2: Manual Production**

```bash
# Build
./scripts/build-prod.sh

# Run
cd dist
GEMINI_API_KEY=YOUR_API_KEY ./server
```

### API Key Configuration

The Gemini API key can be provided in three ways (priority order):

1. **Command Line Argument** (Highest Priority)
   ```bash
   ./scripts/start-dev.sh YOUR_API_KEY
   ./scripts/start-prod.sh -k YOUR_API_KEY
   ```

2. **Environment File** (`.env`)
   ```bash
   # Create .env file in project root
   echo "GEMINI_API_KEY=YOUR_API_KEY" > .env
   ```

3. **Setup Script**
   ```bash
   ./setup-ai.sh
   # Follow prompts to enter your API key
   ```

**Note**: If no API key is provided, the AI question generator will use fallback templates instead of generating unique questions.

### Features to Try

- **Select Problems**: Click any problem from the sidebar (results auto-clear when switching)
- **Choose Languages**: All 14 supported languages: Python, C++, C, Java, Kotlin, Scala, Go, Rust, Swift, Ruby, JavaScript, TypeScript, Bash, Shell, SQL
- **Write Code**: Use the editor with:
  - **Line Numbers**: See line numbers on the left side of the editor
  - **Synchronized Scrolling**: Line numbers scroll with your code
  - **Syntax Highlighting**: Modern monospace fonts for better readability
- **Run Code**: Click "Run Code" to execute and see output in the console
- **Console Output**: View stdout, stderr, and errors in the collapsible console panel
- **Resize Panels**: Drag to adjust problem statement width and console height
- **Collapse/Expand**: Collapse sidebar or console for more screen space
- **Create Problems**: Click "+ Create" to add custom problems with automatic setup
- **AI Question Generator**: Generate unique questions with company/role/level context
- **Dark Mode**: Toggle between light and dark themes
- **Keyboard Shortcuts**: Ctrl+Enter to run, Esc to go back
- **Real Execution**: Code is actually compiled and run with proper error handling
- **Multi-Language Support**: From compiled languages to scripting and database queries

### Supported Languages (15 Total)
- **Compiled**: C, C++, Java, Kotlin, Scala, Go, Rust, Swift
- **Interpreted**: Python, Ruby, JavaScript, TypeScript
- **Scripting**: Bash, Shell scripts
- **Database**: SQL queries
- **ML/Data Science**: Python with scikit-learn, pandas, numpy, matplotlib

### Real Code Execution Engine
The executor performs actual compilation and execution:
- **Python**: Interpreted execution with stdin input
- **C/C++**: GCC compilation followed by native execution
- **Java**: Javac compilation followed by JVM execution
- **Bash/Shell**: Script execution with proper permissions
- **SQL**: Query validation and structure checking
- **Error Handling**: Compilation errors, runtime errors, output validation
- **Test Results**: Pass/fail status with execution time and detailed messages

### Test Case Management
- **Toggle Visibility**: Click "📋 View Test Cases" to show/hide test cases
- **Auto-Hide**: Test cases automatically hide when switching problems
- **Edit Test Cases**: Click "✏️ Edit" to modify test cases for custom problems
- **Add/Remove Tests**: Add new test cases or remove existing ones
- **Save Changes**: Persist test case modifications to the filesystem
- **Real-time Updates**: Changes reflect immediately in the execution engine

### Jupyter Notebook Mode
- **Interactive Coding**: Cell-based execution environment like Jupyter
- **Real-time Output**: See results immediately below each code cell
- **Add/Remove Cells**: Dynamically manage code cells during development
- **Language Support**: Python and JavaScript execution in notebook style
- **Run Individual Cells**: Execute specific cells or run all cells at once
- **Output Persistence**: Cell outputs persist during the session

### ML/Data Science Support
- **Iris Classification**: Sample ML problem with real iris dataset
- **Data Files**: Automatic copying of CSV, JSON, and data files to execution environment
- **ML Libraries**: scikit-learn, pandas, numpy, matplotlib support

### File Upload System
- **Dataset Upload**: Upload CSV, JSON, XLSX, TXT files for data science problems
- **Multiple Files**: Support for uploading multiple files simultaneously
- **File Management**: View uploaded files with remove functionality
- **Execution Integration**: Uploaded files are available during code execution
- **ML Integration**: Perfect for custom datasets and machine learning projects
- **Data Visualization**: Support for generating charts and plots
- **Custom Datasets**: Upload and use custom datasets for ML problems

> ✅ **Complete development environment!** Real execution, custom problems, test case management, and multi-language support all working together.

---

## 🆕 Recent Updates & Fixes

### **Latest Updates (v1.3.0):**
- ✅ **Line Numbers**: Added line numbers to code editor with synchronized scrolling
- ✅ **Command-Line API Key**: Start scripts now accept Gemini API key as argument
- ✅ **Enhanced Console**: Console now shows only code execution output (stdout/stderr)
- ✅ **New `/api/run` Endpoint**: Direct code execution without test case validation
- ✅ **Improved Error Handling**: Better error messages and display
- ✅ **Documentation**: Complete changelog and updated README with running instructions

### **Previous Updates (v1.2.0):**
- ✅ **Browser Navigation**: Fixed refresh/back/forward to work properly with state management
- ✅ **Results Auto-Clear**: Results automatically clear when switching between questions
- ✅ **Test Case Field Mapping**: Fixed "expected output" vs "output" field inconsistency
- ✅ **Test Cases Reset**: Added "Reset" button to restore original test cases
- ✅ **Add Multiple Test Cases**: Ability to add multiple test cases to existing problems
- ✅ **Create Problem Test Cases**: Fixed adding multiple test cases in problem creation
- ✅ **Execution Time Display**: Added execution time and detailed messages to results
- ✅ **Jupyter Cell Reset**: Jupyter cells now reset when switching questions
- ✅ **Enhanced Jupyter Features**: Added "Run All", "Clear All", and cell dependency support

### **Major Issues Resolved:**
- ✅ **Problem Loading Error**: Fixed "Failed to load problem details" error
- ✅ **Code Execution**: Restored ability to run code and get pass/fail results with detailed info
- ✅ **Test Cases Display**: Fixed test cases toggle functionality with X button
- ✅ **Test Cases Editing**: Added edit mode for custom problem test cases with save/cancel/reset
- ✅ **Jupyter Notebook**: Implemented full Jupyter-style interface with enhanced features
- ✅ **File Upload Independence**: Test case inputs don't conflict with uploaded files
- ✅ **Code Editor Reset**: Code editor now properly updates when switching problems
- ✅ **Dark Mode Button**: Restored dark/light mode toggle functionality

### **New Features Added:**
- ✅ **Custom Problem Creation**: Complete UI-driven problem creation system with multiple test cases
- ✅ **Interactive Jupyter Mode**: Cell-based coding with run all, clear all, and dependency support
- ✅ **Advanced Test Case Management**: View, edit, add, remove, and reset test cases
- ✅ **Comprehensive File Upload**: Support for ML datasets and multiple files
- ✅ **Enhanced Error Handling**: Better error messages and user feedback
- ✅ **Browser Navigation**: Enhanced back/forward button support with proper state clearing
- ✅ **Connection Status**: Real-time backend connectivity indicator
- ✅ **Detailed Results**: Execution time, test counts, and error messages in results

### **Production Ready:**
- ✅ **Cross-platform builds** (Linux/macOS/Windows)
- ✅ **Docker containerization** with optimized images
- ✅ **Automated build scripts** for all platforms
- ✅ **Production deployment** instructions
- ✅ **All features tested** and working

---

## 🚀 Future Enhancements (Roadmap)

### ML/AI & Data Science Support
- **Data File Uploads**: Support for CSV, JSON, images, and other data formats
- **Graph/Table Rendering**: Display matplotlib charts, pandas DataFrames, and plotly visualizations
- **ML Libraries**: Integration with scikit-learn, TensorFlow, PyTorch
- **Jupyter Notebook Interface**: Cell-based code execution with markdown support
- **Dataset Management**: Built-in sample datasets for practice problems
- **Interactive Data Analysis**: Real-time data exploration and visualization

### Advanced Features
- **Code Analysis**: Syntax highlighting, linting, and code quality metrics
- **Performance Profiling**: Execution time analysis and optimization suggestions
- **Collaborative Coding**: Multi-user problem solving and code review
- **Progress Tracking**: Learning analytics and skill assessment
- **Plugin System**: Extensible architecture for custom languages and tools

### Production Enhancements
- **Container Orchestration**: Kubernetes deployment with auto-scaling
- **Advanced Sandboxing**: Enhanced security with gVisor and seccomp
- **Monitoring & Analytics**: Prometheus metrics and ELK stack integration
- **API Rate Limiting**: DDoS protection and fair usage policies
- **Backup & Recovery**: Automated data backup and disaster recovery

---

## 🚀 Production Deployment

### Cross-Platform Build Scripts

CeesarCode supports seamless production builds on **Windows**, **macOS**, and **Linux**.

#### Quick Start (All Platforms)

**Option 1: Automated Build Scripts**
```bash
# Linux/macOS
./build.sh

# Windows
build.bat
```

**Option 2: Manual Build**
```bash
# Install dependencies
pip3 install --break-system-packages pandas numpy scikit-learn matplotlib

# Build Rust executor
cd src/executor && cargo build --release

# Build Go backend
cd ../backend && go build -o ../../bin/server .

# Build React frontend
cd ../frontend && npm install && npm run build

# Copy to production
mkdir -p ../../dist && cp -r dist/* ../../dist/
cp ../../bin/server ../../dist/
cp -r target/release ../../dist/
cp -r ../../data ../../dist/
```

#### Platform-Specific Instructions

**🐧 Linux**
```bash
# Install system dependencies
sudo apt-get update
sudo apt-get install -y build-essential pkg-config libssl-dev curl

# Install Go, Rust, Node.js (see Prerequisites section)

# Run build script
./build.sh

# Start production server
cd dist && ./server
```

**🍎 macOS**
```bash
# Install dependencies via Homebrew
brew install go rust node

# Install Python ML libraries
pip3 install --break-system-packages pandas numpy scikit-learn matplotlib

# Build and run
./build.sh
cd dist && ./server
```

**🪟 Windows**
```bash
# Install dependencies:
# - Go: https://golang.org/dl/
# - Rust: https://rustup.rs/
# - Node.js: https://nodejs.org/
# - Python: https://python.org/

# Install Python ML libraries
pip install pandas numpy scikit-learn matplotlib

# Build and run
build.bat
cd dist
server.exe
```

### Docker Deployment (All Platforms)

```bash
# Build Docker image
docker build -f config/Dockerfile -t ceesarcode .

# Run container
docker run -p 8080:8080 ceesarcode

# Or use docker-compose (includes health checks)
docker-compose -f config/docker-compose.yml up

# View logs
docker-compose -f config/docker-compose.yml logs -f
```

### Production Checklist

- ✅ **Cross-platform builds** (Windows/macOS/Linux)
- ✅ **Docker containerization**
- ✅ **Python ML libraries** pre-installed
- ✅ **Static file serving** optimized
- ✅ **Security hardening** (sandboxed execution)
- ✅ **Performance optimization** (compiled binaries)

### System Requirements

**Minimum Hardware:**
- 2GB RAM
- 1GB disk space
- Any modern CPU

**Software Dependencies:**
- Go 1.19+
- Rust 1.70+
- Node.js 18+
- Python 3.8+ (with ML libraries)

## 🧪 Real grading with Docker (local dev / CI)

This mode runs user code inside minimal Docker images (no Firecracker needed).

1) **Build runner images**
```bash
docker build -t ceesarcode-runner-python:latest  ./runner-images/python
docker build -t ceesarcode-runner-cpp:latest     ./runner-images/cpp
docker build -t ceesarcode-runner-sqlite:latest  ./runner-images/sqlite
```

2) **Swap in the full executor (recommended)**
- Option A (if you downloaded the “metrics+firecracker” pack): copy its `executor-rs/` over this one.
- Option B (build from source yourself): use the Firecracker/metrics variant you prefer.

3) **Build executor**
```bash
cd src/executor
cargo build --release
```

4) **Run backend with Docker mode**
```bash
export EXECUTOR_MODE=docker
cd src/backend
go run main.go
```

5) **Run frontend**
```bash
cd src/frontend
npm run dev
```

Submit a solution from the UI; the executor will:
- Start the language runner container with **no network**.
- Mount the **problem bundle** read‑only and **submission** dir read‑write.
- Emit the **runner JSON** back to the backend/UI.

**Troubleshooting**
- `docker: not found` → install Docker Desktop / engine.
- `unsupported lang` → ensure `language` matches your runner image names.

---

## 🛡️ Production‑grade isolation with Firecracker (microVM)

> Best choice for untrusted code at scale. Requires Linux with KVM and an uncompressed `vmlinux` kernel.

### 1) Build the **guest rootfs** (once)
```bash
cd vm/guest
sudo ./build-rootfs.sh
# → creates vm/guest/rootfs.ext4 (Debian minimal with Python, g++, sqlite3, jq)
export FC_ROOTFS="$(pwd)/rootfs.ext4"
export FC_KERNEL="/path/to/vmlinux"    # uncompressed, virtio enabled
```

### 2) Use the **full executor** (not the demo stub)
- Copy in the hardened `src/executor/` (Firecracker + timeouts + metrics) and build:
```bash
cd src/executor
cargo build --release
```

### 3) Run backend with Firecracker mode
```bash
export EXECUTOR_MODE=firecracker
export FC_KERNEL=/abs/path/to/vmlinux
export FC_ROOTFS=/abs/path/to/vm/guest/rootfs.ext4

# Optional observability
export EXECUTOR_BUDGET_MS=15000         # kill-on-budget for VM/runner
export EXECUTOR_KILL_GRACE_MS=1000
export METRICS_TEXTFILE_DIR=/var/lib/node_exporter/textfile_collector

cd src/backend
go run main.go
```

### 4) Frontend
```bash
cd src/frontend && npm run dev
```

### Testing Production Build

```bash
# After building, test the production server
cd dist
./server  # Linux/macOS
# or server.exe  # Windows

# Test API endpoints
curl http://localhost:8080/api/problems
curl http://localhost:8080/api/problem/float-mean

# Test file uploads (ML datasets)
curl -X POST http://localhost:8080/api/upload \
  -F "file=@/path/to/your/dataset.csv"

# Open browser
open http://localhost:8080  # macOS
# or start http://localhost:8080  # Windows
```

### How it works
```mermaid
sequenceDiagram
  participant Host
  participant Executor
  participant Firecracker
  participant VM as Guest VM
  participant Runner

  Host->>Executor: job.json (stdin)
  Executor->>Firecracker: boot with config (rootfs, problem.img, workspace.img)
  Firecracker->>VM: init=/runner-dispatch
  VM->>Runner: run language-specific runner
  Runner->>VM: write /workspace/result.json
  VM-->>Firecracker: poweroff
  Executor->>Host: read result.json via debugfs
  Host-->>UI: JSON verdict/tests
```

**Security notes**
- Read‑only problem image; read‑write workspace.
- No networking in the VM.
- Use jailer + cgroups + seccomp on Firecracker in prod.
- Validate kernel and rootfs checksums.

---

## 🧩 Backend API

- `GET /api/problems` → list problems
- `GET /api/problem/{id}` → one problem (title, statement, languages, stub)
- `POST /api/submit`
  ```jsonc
  {
    "problemId": "float-mean",
    "language": "python", // or "cpp" | "sql"
    "files": {
      "Main.py": "print('hello')"
    }
  }
  ```
  Returns: runner JSON (see contract above).

**Curl example**
```bash
curl -s -XPOST localhost:8080/api/submit \
 -H 'Content-Type: application/json' \
 -d '{"problemId":"float-mean","language":"python","files":{"Main.py":"print(2.0)"}}' | jq
```

**UI Features:**
- Modern grey and off-white color scheme
- Dark mode toggle (🌙/☀️)
- Responsive design
- Loading states and error handling
- Code syntax highlighting
- Test results display with color coding
- Navigation between problems

---

## ⚙️ Environment variables

| Var | Purpose | Default |
|---|---|---|
| `EXECUTOR_MODE` | `docker` \| `firecracker` \| *(stub uses current)* | `docker` (backend default) |
| `EXECUTOR_BUDGET_MS` | Global execution budget | `15000` |
| `EXECUTOR_KILL_GRACE_MS` | Delay after kill before finalize | `1000` |
| `FC_KERNEL` | Path to uncompressed kernel | *(required in FC mode)* |
| `FC_ROOTFS` | Path to guest ext4 image | *(required in FC mode)* |
| `METRICS_TEXTFILE_DIR` | Prometheus textfile output dir | *(off if empty)* |

---

## 🧱 Adding a new problem

### Method 1: Manual Creation
1) Create a folder `data/problems/<id>/v1/`
2) Add `manifest.json`:
```json
{
  "id": "two-sum",
  "title": "Two Sum",
  "statement": "Given n and an array, print indices i j...",
  "languages": ["python","cpp"],
  "stub": {
    "python": "print('TODO')",
    "cpp": "// TODO"
  }
}
```
3) Add tests under `v1/public/*.in` and `*.out`.
4) (Optional) Add `v1/checker/checker.py` for tolerance/partial credit.

### Method 2: UI Creation (Recommended)
1) Click **"+ Create"** in the sidebar
2) Fill in problem title and statement
3) Select supported languages (multi-select dropdown)
4) Click **"Create Problem"**
5) The system automatically creates the directory structure and files

**Checker contract** (stdin = candidate output; argv: `<in> <out>`), must print:
```json
{"ok": true, "message": ""}
```

---

## 🧰 Local dev tips

- Frontend proxies `/api` to `:8080` (see `vite.config.js`).
- In Docker mode, the executor spawns containers **without network**.
- In Firecracker mode, artifacts are built under `/tmp/ceesarcode-fc-<submission_id>` on the host.

---

## 🩺 Troubleshooting

| Symptom | Fix |
|---|---|
| `docker: command not found` | Install Docker and ensure your user can run it. |
| `firecracker not found` | Install Firecracker and put it in `$PATH`. |
| `FC_KERNEL not set` | Provide a valid uncompressed `vmlinux`. |
| VM boots but no result | Check `runner-dispatch` and that the runner exists for the chosen language. |
| WrongAnswer but looks correct | Whitespace newlines matter unless checker tolerates; trim output or add a checker. |
| SQL results mismatch | Compare normalized CSVs; ensure `ORDER BY` is deterministic. |

---

## 📦 Production checklist

- Use the **hardened executor** (Docker/Firecracker with timeouts + metrics).
- Pin runner image digests; keep images minimal.
- Configure **node_exporter** textfile collector to pick up metrics.
- Add **request/trace ID** → set `EXECUTOR_SPAN_ID` for correlation.
- Quarantine temp dirs; scrub artifacts after grading.
- Resource limits: cgroups (CPU/mem/pids/io), UIDs/GIDs in guest, seccomp/Jailer.

---

## 📄 JSON Question Upload Format

### **Bulk Question Upload**
Use the "📝 Upload Questions" button to upload multiple questions from a JSON file. The JSON format should be:

```json
[
  {
    "title": "Two Sum",
    "statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1].",
    "languages": ["python", "cpp", "java"],
    "stub": {
      "python": "def two_sum(nums, target):\n    # Your solution here\n    pass\n\nif __name__ == '__main__':\n    nums = list(map(int, input().split()))\n    target = int(input())\n    result = two_sum(nums, target)\n    print(' '.join(map(str, result)))",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    return 0;\n}",
      "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your solution here\n    }\n}"
    }
  },
  {
    "title": "Reverse String", 
    "statement": "Write a function that reverses a string. The input string is given as an array of characters s.",
    "languages": ["python"],
    "stub": {
      "python": "s = input().strip()\nprint(s[::-1])"
    }
  }
]
```

### **JSON Format Requirements:**
- **Root**: Must be an array of question objects
- **title** (string, required): Problem title
- **statement** (string, required): Problem description with examples
- **languages** (array, required): Supported programming languages
- **stub** (object, required): Code templates for each language
  - Key: language name (must match supported languages)
  - Value: starter code template

### **Supported Languages:**
`python`, `cpp`, `c`, `java`, `kotlin`, `scala`, `go`, `rust`, `swift`, `ruby`, `javascript`, `typescript`, `bash`, `sh`, `sql`

---

## 🆕 Recent Updates & New Features

### **Enhanced User Interface**
- ✅ **Browser Navigation**: Back, Forward, and Refresh buttons
- ✅ **Dual Code Execution**: 
  - **Run Code**: Test against single test case for quick validation
  - **Submit Code**: Test against all test cases for final submission
- ✅ **Enhanced Jupyter Mode**: Upload Data button for dataset management
- ✅ **Bulk Question Management**: Upload multiple questions from JSON files
- ✅ **Advanced Test Case Editing**: 
  - Add single test case
  - Add multiple test cases (1-20 at once)
  - Enhanced editing interface

### **Safety & Error Handling**
- ✅ **Comprehensive Error Boundaries**: Prevent UI crashes from null/undefined values
- ✅ **Safe Array State Management**: Custom hooks for robust state handling
- ✅ **API Response Validation**: Multiple layers of data validation
- ✅ **Graceful Error Recovery**: User-friendly error messages and fallbacks

### **File Management**
- ✅ **Upload Data**: Local file upload for specific problems (CSV, JSON, TXT, etc.)
- ✅ **Upload Questions**: JSON file upload for multiple problem creation
- ✅ **Enhanced File Safety**: Robust handling of file uploads and downloads
- ✅ **CSV File Support**: Proper handling for ML/Data Science problems

---

---

## 📚 Additional Documentation

For comprehensive documentation on each component, see:

- **[Backend API Documentation](./BACKEND_API.md)** - Complete API reference with all endpoints, request/response formats, and integration details
- **[Frontend UI Documentation](./FRONTEND_UI.md)** - Detailed UI component documentation, state management, and feature guides
- **[AI Question Generation](./AI_QUESTION_GENERATION.md)** - Complete guide including setup, all three AI providers, web search feature (12 concurrent searches), prompt engineering, and troubleshooting
- **[LANGUAGE_SETUP.md](./LANGUAGE_SETUP.md)** - Complete language installation guide with performance benchmarks and troubleshooting
- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Complete production deployment guide with Docker setup, checklist, and verification
- **[CHANGELOG.md](./CHANGELOG.md)** - Detailed changelog of all changes and updates
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Detailed project structure and file organization

---

## 📝 License

MIT. Use at will.
