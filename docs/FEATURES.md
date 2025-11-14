# CeesarCode Features Documentation

## Overview

This document provides a comprehensive overview of all features in CeesarCode, including recent additions and improvements.

---

## ✨ Latest Features (v1.4.0)

### 1. System Design Questions with Excalidraw Canvas

**Description**: Full support for system design interview questions with interactive diagramming using Excalidraw.

**Features**:
- System design questions can be created manually or generated via AI
- Excalidraw canvas appears in the main workspace after question creation
- Canvas replaces code editor for system design questions
- Fullscreen mode for better design experience
- Auto-save drawings to backend as you work
- Lazy loading with error boundaries for reliability

**Workflow**:
1. Create system design question (title and statement only)
2. Question appears in problem list with "System Design" badge
3. Select question to open Excalidraw canvas
4. Draw architecture diagrams using the canvas
5. Click "Fullscreen" button for maximum workspace
6. Drawings are automatically saved

**Technical Details**:
- Excalidraw component lazy-loaded to prevent blocking
- Error boundaries catch and display errors gracefully
- Memoized onChange handler prevents infinite loops
- Proper serialization (removes non-serializable Map objects)
- Supports both uppercase and lowercase Type fields

---

### 2. Delete Individual Questions

**Description**: Delete any question directly from the problem list.

**Features**:
- Delete button (🗑️) on each problem card
- Confirmation dialog before deletion
- Removes problem directory and all associated files
- Clears selection if deleted problem was currently selected
- Updates problem list immediately after deletion

**API Endpoint**: `DELETE /api/problems/{id}`

**Usage**:
- Hover over any problem in the sidebar
- Click the trash icon on the right
- Confirm deletion in the dialog
- Problem is permanently removed

---

### 3. CeesarCode Logo with Homepage Navigation

**Description**: Professional logo with clickable navigation to homepage.

**Features**:
- Modern SVG logo with gradient design
- Stylized "C" letter with code bracket decorations
- "CeesarCode" text with gradient styling
- "Technical Interview Practice" subtitle
- Clickable - navigates to homepage
- Hover effects for better UX

**Homepage Navigation**:
- Clears selected problem
- Resets code editor
- Clears results and errors
- Resets Jupyter mode
- Exits fullscreen if active
- Smooth scroll to top

---

### 4. Simplified System Design Prompts

**Description**: AI-generated system design questions now use simple, concise prompts.

**Changes**:
- Removed detailed functional/non-functional requirements
- Removed constraints and assumptions sections
- Simple question prompts like "Design a machine learning based system to detect fraudulent signals on ads datasets"
- Brief context allowed but kept minimal
- Works for all AI providers (Gemini, OpenAI, Claude)

**Example Output**:
- Before: Detailed problem with requirements, constraints, use cases
- After: "Design a distributed caching system for a global e-commerce platform"

---

## ✨ Previous Features (v1.3.0)

### 1. Line Numbers in Code Editor

**Description**: Added line numbers to the code editor for better code navigation and debugging.

**Features**:
- Line numbers displayed on the left side of the code editor
- Numbers update automatically as code changes
- Synchronized scrolling with code content
- Styled to match editor theme (dark/light mode)
- Non-selectable for better UX

**Implementation**:
- Line numbers are rendered in a separate div element
- Uses the same font family and line height as the code editor
- Scroll position is synchronized using `onScroll` event handler
- Line numbers are generated dynamically based on code line count

**Usage**:
- Line numbers appear automatically when you open the code editor
- No configuration needed - works out of the box

---

### 2. Command-Line API Key Support

**Description**: Start scripts now accept Gemini API key as a command-line argument for easier configuration.

**Development Script** (`scripts/start-dev.sh`):
```bash
# With API key as argument
./scripts/start-dev.sh YOUR_GEMINI_API_KEY

# Without API key (uses .env file or fallback)
./scripts/start-dev.sh
```

**Production Script** (`scripts/start-prod.sh`):
```bash
# With API key using flag
./scripts/start-prod.sh -k YOUR_API_KEY
./scripts/start-prod.sh --api-key YOUR_API_KEY

# With API key as positional argument (if starts with "AIza")
./scripts/start-prod.sh YOUR_API_KEY

# Combined with other options
./scripts/start-prod.sh -p 9000 -k YOUR_API_KEY -d
```

**Priority Order**:
1. Command-line argument (highest priority)
2. `.env` file (`GEMINI_API_KEY` variable)
3. Fallback templates (if no key provided)

**Benefits**:
- No need to create `.env` file for one-time runs
- Easy to use in CI/CD pipelines
- Supports different API keys for different environments

---

### 3. Enhanced Console Output

**Description**: Console now acts as a pure terminal, showing only code execution output.

**Features**:
- Shows stdout from code execution
- Shows stderr/runtime errors
- Shows compilation errors (for compiled languages)
- No test case verdicts or status messages
- Clean, terminal-like output display

**Display Priority**:
1. `result.result` - stdout output (if available)
2. `result.error` - stderr/runtime errors (if no stdout)
3. `result.compile_log` - compilation errors (if no stdout/error)
4. "(No output)" message (if nothing to display)

**Console Features**:
- Collapsible (click to expand/collapse)
- Resizable height (drag to adjust)
- Clear button to remove output
- Running indicator when code is executing
- Positioned underneath code editor section

---

### 4. New `/api/run` Endpoint

**Description**: Direct code execution endpoint that returns stdout/stderr without test case validation.

**Endpoint**: `POST /api/run`

**Request Format**:
```json
{
  "language": "python",
  "files": {
    "Main.py": "print('Hello World!')"
  },
  "input": ""
}
```

**Response Format**:
```json
{
  "result": "Hello World!\n",
  "error": ""
}
```

**Supported Languages**:
- Python, JavaScript, TypeScript (interpreted)
- Java, C++, C, Go, Rust, Swift (compiled)
- Ruby, Bash, Shell (scripted)
- SQL (requires database setup)

**Features**:
- Direct code execution without test cases
- Returns actual stdout/stderr
- Proper error handling and logging
- Temporary file cleanup after execution

---

## 🎨 UI Features

### Code Editor

**Line Numbers**:
- Displayed on the left side
- Synchronized with code scrolling
- Updates automatically with code changes
- Styled for dark/light mode

**Layout**:
- Side-by-side with problem statement
- Resizable width (25%-75%)
- Full height with console below
- Scrollable to end of last line

**Features**:
- Syntax highlighting support
- Tab completion
- Keyboard shortcuts (Ctrl+Enter to run)
- Language-specific file naming

### Problem Statement Panel

**Features**:
- Resizable width (25%-75%)
- Scrollable content
- Markdown support
- Code examples display

### Console Output Panel

**Features**:
- Collapsible (40px when collapsed)
- Resizable height (100px-600px)
- Clear button
- Running indicator
- Terminal-like output display

### Sidebar

**Features**:
- Collapsible
- Resizable width (200px-600px)
- Problem list with search
- Create problem button
- AI question generator button

---

## 🔧 Configuration

### API Key Management

**Method 1: Command Line (Recommended for one-time use)**
```bash
./scripts/start-dev.sh YOUR_API_KEY
./scripts/start-prod.sh -k YOUR_API_KEY
```

**Method 2: Environment File (Recommended for persistent use)**
```bash
# Create .env file
echo "GEMINI_API_KEY=YOUR_API_KEY" > .env
```

**Method 3: Setup Script**
```bash
./setup-ai.sh
```

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for AI question generation | None (uses fallback) |
| `EXECUTOR_MODE` | Execution mode: `docker` \| `firecracker` | `docker` |
| `PORT` | Backend server port | `8080` |

---

## 📝 Code Execution

### Execution Flow

1. User writes code in the editor
2. User clicks "Run Code" button
3. Frontend sends POST to `/api/run` with code and language
4. Backend creates temporary directory
5. Backend writes code file(s)
6. Backend executes code based on language
7. Backend captures stdout and stderr
8. Backend returns JSON response
9. Frontend displays result in console

### Language Support

**Interpreted Languages**:
- Python: Direct execution with `python3`
- JavaScript: Execution with `node`
- TypeScript: Compile with `tsc`, then run with `node`
- Ruby: Execution with `ruby`

**Compiled Languages**:
- C++: Compile with `g++`, then execute
- C: Compile with `gcc`, then execute
- Java: Compile with `javac`, then run with `java`
- Go: Run with `go run`
- Rust: Compile with `rustc`, then execute
- Swift: Execution with `swift`

**Scripted Languages**:
- Bash/Shell: Execution with `bash`

**Database**:
- SQL: Requires database setup (currently returns error)

---

## 🐛 Troubleshooting

### Line Numbers Not Showing

- Ensure you're in IDE mode (not Jupyter mode)
- Check browser console for errors
- Refresh the page

### API Key Not Working

- Check if API key is provided correctly
- Verify API key format (should start with "AIza")
- Check backend logs for API errors
- Try using `.env` file instead of command line

### Code Execution Not Working

- Check if language runtime is installed (e.g., `python3`, `node`, `g++`)
- Check backend logs for execution errors
- Verify file permissions
- Check console output for error messages

### Console Not Showing Output

- Ensure console is expanded (not collapsed)
- Check if code executed successfully
- Look for errors in browser console
- Verify backend `/api/run` endpoint is working

---

## 📚 Related Documentation

- [README.md](./README.md) - Main documentation
- [CHANGELOG.md](./CHANGELOG.md) - Detailed changelog
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project structure
- [LANGUAGE_SETUP.md](./LANGUAGE_SETUP.md) - Language setup guide

