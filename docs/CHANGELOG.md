# CeesarCode Changelog

## Recent Updates

### Version 1.4.0 - System Design Questions & Enhanced Features

#### ✨ New Features

1. **System Design Questions with Excalidraw Canvas**
   - Full support for system design interview questions
   - Excalidraw canvas appears in main workspace after question creation
   - Canvas replaces code editor for system design questions
   - Fullscreen mode for better design experience
   - Auto-save drawings to backend as you work
   - Lazy loading with error boundaries for reliability
   - Works for both manually created and AI-generated questions

2. **Delete Individual Questions**
   - Delete button (🗑️) on each problem card
   - Confirmation dialog before deletion
   - Removes problem directory and all associated files
   - Clears selection if deleted problem was currently selected
   - API endpoint: `DELETE /api/problems/{id}`

3. **CeesarCode Logo with Homepage Navigation**
   - Professional SVG logo with gradient design
   - Stylized "C" letter with code bracket decorations
   - "CeesarCode" text with gradient styling
   - "Technical Interview Practice" subtitle
   - Clickable - navigates to homepage
   - Hover effects for better UX

4. **Simplified System Design Prompts**
   - AI-generated system design questions use simple, concise prompts
   - Removed detailed functional/non-functional requirements
   - Example: "Design a machine learning based system to detect fraudulent signals on ads datasets"
   - Works for all AI providers (Gemini, OpenAI, Claude)

#### 🔧 Improvements

1. **System Design Workflow**
   - Creation modal simplified (title and statement only)
   - Canvas appears after question is created and selected
   - Proper error handling and loading states
   - Supports both uppercase and lowercase Type fields

2. **Problem Management**
   - Type badges in problem list ("System Design" badge)
   - Delete functionality with confirmation
   - Better state management for problem selection

3. **UI Enhancements**
   - Logo replaces plain text header
   - Homepage navigation function
   - Improved error boundaries

#### 🐛 Bug Fixes

1. **System Design Creation**
   - Fixed blank screen when selecting System Design type
   - Fixed infinite loop in Excalidraw onChange handler
   - Fixed collaborators Map serialization issue
   - Proper handling of existing system design questions

2. **Delete Functionality**
   - Fixed 404 errors on delete endpoint
   - Proper route handling for DELETE requests
   - URL decoding for problem IDs with special characters

---

### Version 1.3.0 - UI Enhancements & API Key Management

#### ✨ New Features

1. **Line Numbers in Code Editor**
   - Added line numbers to the code editor for better code navigation
   - Line numbers sync with code scrolling
   - Styled to match the editor theme (dark/light mode)
   - Line numbers are non-selectable and positioned on the left side

2. **Command-Line API Key Support**
   - Start scripts now accept Gemini API key as a command-line argument
   - Development script: `./scripts/start-dev.sh [GEMINI_API_KEY]`
   - Production script: `./scripts/start-prod.sh -k YOUR_API_KEY` or `./scripts/start-prod.sh --api-key YOUR_API_KEY`
   - API key priority: Command line argument > .env file > Fallback templates

3. **Enhanced Console Output**
   - Console now shows only code execution results (stdout/stderr)
   - Removed test case verdicts and status messages
   - Console acts as a pure terminal output display
   - Improved error handling to show actual backend errors

4. **New `/api/run` Endpoint**
   - Direct code execution endpoint that returns stdout/stderr
   - Supports all 14 programming languages
   - Returns JSON: `{result: stdout, error: stderr}`
   - No test case validation - pure code execution

#### 🔧 Improvements

1. **Code Editor**
   - Line numbers with synchronized scrolling
   - Better visual separation between line numbers and code
   - Improved code editor layout and spacing

2. **Error Handling**
   - Better error messages from backend
   - HTTP errors are properly displayed with actual error text
   - Console only shows code execution output, not HTTP errors

3. **Start Scripts**
   - Enhanced argument parsing for API keys
   - Better help messages and usage examples
   - Improved error messages and status reporting

#### 🐛 Bug Fixes

1. **404 Error on `/api/run`**
   - Fixed missing route registration in `src/backend/cmd/server/main.go`
   - Added complete `runCode` function and all language execution functions
   - Server now properly handles code execution requests

2. **Console Output Display**
   - Fixed console not showing code output
   - Properly displays stdout from code execution
   - Handles errors and stderr correctly

3. **Line Number Synchronization**
   - Line numbers now properly sync with code scrolling
   - Fixed line number display when code changes

#### 📝 Documentation

1. **Updated README.md**
   - Added complete running instructions
   - Documented API key usage in start scripts
   - Added examples for all start script options

2. **Created CHANGELOG.md**
   - Comprehensive changelog of all recent updates
   - Detailed feature descriptions
   - Bug fix documentation

---

### Version 1.2.0 - Modern UI & Layout Improvements

#### ✨ New Features

1. **LeetCode-Style Layout**
   - Side-by-side problem statement and code editor
   - Resizable panes (problem statement width, console height)
   - Collapsible sidebar and console
   - Console positioned underneath code section

2. **Resizable Panels**
   - Problem statement pane: 25%-75% width adjustable
   - Console output pane: 100px-600px height adjustable
   - Sidebar: 200px-600px width adjustable
   - All sizes persist in localStorage

3. **Collapsible UI Elements**
   - Sidebar can be collapsed/expanded
   - Console can be collapsed/expanded
   - Collapsed elements remain visible with expand option
   - Consistent button positioning

4. **Jupyter Mode Enhancements**
   - Each cell shows its own output
   - No separate console in Jupyter mode
   - Cell-based execution and output display

#### 🔧 Improvements

1. **UI Modernization**
   - Removed random emojis, replaced with Unicode symbols
   - Modern color palette and typography
   - Improved spacing, shadows, and transitions
   - Better hover effects and interactivity

2. **Code Editor**
   - Proper scrolling to end of last line
   - Dynamic height calculation based on console
   - Better overflow handling

3. **AI Agent Modal**
   - Custom role input field
   - Optional job description field
   - Optional company description field
   - Toggle between preset roles and custom role

#### 🐛 Bug Fixes

1. **Test Cases Removal**
   - Completely removed test case functionality
   - Removed all test case UI elements
   - Questions no longer validated against test cases

2. **Console Output**
   - Console now only shows code execution output
   - Removed "Accepted"/"Rejected" verdicts
   - Removed test case summaries

---

### Version 1.1.0 - AI Question Generator

#### ✨ New Features

1. **AI Question Generator**
   - Generate unique coding interview questions using Google Gemini AI
   - Company-specific questions (Netflix, Uber, Google, etc.)
   - Role-specific questions (Backend, Frontend, ML Engineer, etc.)
   - Level-appropriate questions (Junior, Mid, Senior)
   - Custom role support
   - Optional job description and company description fields

#### 🔧 Improvements

1. **Error Handling**
   - Better error messages for AI generation failures
   - Retry logic with exponential backoff
   - Model fallback mechanism
   - Improved logging

---

## Technical Details

### Line Numbers Implementation

The line numbers are implemented as a separate div element positioned to the left of the code textarea. They:
- Display line numbers 1, 2, 3, etc.
- Sync scrolling with the code editor
- Use the same font family and line height as the code editor
- Are styled differently in dark/light mode
- Are non-selectable (userSelect: 'none')

### API Key Management

The API key can be provided in three ways (in order of priority):
1. **Command line argument**: `./scripts/start-dev.sh YOUR_API_KEY` or `./scripts/start-prod.sh -k YOUR_API_KEY`
2. **Environment file**: Create a `.env` file with `GEMINI_API_KEY=YOUR_API_KEY`
3. **Fallback**: If no API key is provided, the AI agent uses fallback templates

### Code Execution Flow

1. User clicks "Run Code" button
2. Frontend sends POST request to `/api/run` with code and language
3. Backend creates temporary directory and writes code file
4. Backend executes code based on language
5. Backend captures stdout and stderr
6. Backend returns JSON: `{result: stdout, error: stderr}`
7. Frontend displays result in console output panel

### Supported Languages

All 14 languages support direct execution:
- Python, JavaScript, TypeScript (interpreted)
- Java, C++, C, Go, Rust, Swift (compiled)
- Ruby, Bash, Shell (scripted)
- SQL (requires database setup)

