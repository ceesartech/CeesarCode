# Frontend UI - Comprehensive Documentation

## Overview

The CeesarCode frontend is a modern React application built with Vite, providing a comprehensive coding interview practice platform with a beautiful, responsive UI, dark mode support, and extensive features for problem solving, code execution, and AI question generation.

## Table of Contents

- [Architecture](#architecture)
- [Core Components](#core-components)
- [UI Features](#ui-features)
- [State Management](#state-management)
- [Code Editor](#code-editor)
- [Problem Management](#problem-management)
- [Code Execution](#code-execution)
- [AI Question Generator](#ai-question-generator)
- [Jupyter Mode](#jupyter-mode)
- [File Upload System](#file-upload-system)
- [Styling & Theming](#styling--theming)

---

## Architecture

### Technology Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: JavaScript (JSX)
- **Styling**: Inline styles with theme system
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Fetch API

### Project Structure

```
src/frontend/
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

### Build Process

```bash
npm install          # Install dependencies
npm run dev         # Development server
npm run build       # Production build
```

---

## Core Components

### App.jsx

The main application component containing all UI logic and state management.

**Key Responsibilities**:
- Problem list management
- Code editor state
- Execution results
- UI theme management
- Navigation handling
- API communication

### Component Structure

```
App
├── Sidebar (Problem List)
├── Main Content Area
│   ├── Problem Statement Panel
│   ├── Code Editor Panel
│   └── Console/Results Panel
├── Toolbar
│   ├── Language Selector
│   ├── Run/Submit Buttons
│   └── Mode Toggle
└── AI Question Generator Modal
```

---

## UI Features

### Layout

#### Sidebar
- **Collapsible**: Toggle visibility
- **Resizable**: Drag to adjust width
- **Problem List**: Scrollable list of all problems
- **Search/Filter**: (Future enhancement)
- **Create Button**: Quick access to problem creation

#### Main Content Area
- **Problem Statement**: Left panel with problem description
- **Code Editor**: Center panel with syntax highlighting
- **Console/Results**: Bottom panel with execution output
- **Resizable Panels**: Drag borders to adjust sizes

#### Toolbar
- **Language Selector**: Dropdown for 14+ languages
- **Run Code**: Quick execution button
- **Submit Code**: Full test case evaluation
- **Mode Toggle**: IDE vs Jupyter mode
- **Theme Toggle**: Dark/Light mode

### Navigation

- **Browser Back/Forward**: Properly handled
- **Problem Selection**: Updates URL and state
- **Keyboard Shortcuts**: Ctrl+Enter to run
- **Auto-clear Results**: Clears when switching problems

### Responsive Design

- **Desktop**: Full three-panel layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Stacked layout (future enhancement)

---

## State Management

### Main State Variables

```javascript
const [problems, setProblems] = useState([])           // Problem list
const [selectedProblem, setSelectedProblem] = useState(null)
const [code, setCode] = useState('')                    // Current code
const [language, setLanguage] = useState('python')      // Selected language
const [result, setResult] = useState(null)              // Execution results
const [isDarkMode, setIsDarkMode] = useState(false)    // Theme
const [mode, setMode] = useState('ide')                 // IDE or Jupyter
const [agentRequest, setAgentRequest] = useState({...}) // AI generator state
```

### State Updates

- **Problem Selection**: Updates code, clears results
- **Language Change**: Updates code stub
- **Code Execution**: Updates results state
- **Theme Toggle**: Updates all UI components

### Effect Hooks

```javascript
// Load problems on mount
useEffect(() => {
  fetchProblems()
}, [])

// Update code when problem/language changes
useEffect(() => {
  loadCodeStub()
}, [selectedProblem, language])

// Handle browser navigation
useEffect(() => {
  // Back/forward button handling
}, [])
```

---

## Code Editor

### Features

- **Syntax Highlighting**: Language-specific colors
- **Line Numbers**: Numbered lines with synchronized scrolling
- **Monospace Font**: Consistent character width
- **Resizable**: Adjustable height
- **Tab Support**: Proper indentation
- **Copy/Paste**: Standard clipboard operations

### Editor Implementation

```javascript
<textarea
  value={code}
  onChange={(e) => setCode(e.target.value)}
  style={{
    fontFamily: 'monospace',
    fontSize: '14px',
    // ... styling
  }}
/>
```

### Line Numbers

```javascript
// Line number display
<div className="line-numbers">
  {code.split('\n').map((_, i) => (
    <div key={i}>{i + 1}</div>
  ))}
</div>
```

### Language Support

All 14+ languages supported with appropriate syntax highlighting hints.

---

## Problem Management

### Problem List

- **Loading**: Fetches from `/api/problems`
- **Display**: Shows problem titles
- **Selection**: Click to load problem
- **Auto-refresh**: Updates after AI generation

### Problem Display

- **Title**: Problem name
- **Statement**: Full problem description
- **Examples**: Input/output examples
- **Constraints**: Problem constraints
- **Languages**: Supported languages

### Problem Creation

- **UI Form**: Modal with input fields
- **Title**: Problem title
- **Statement**: Problem description
- **Languages**: Multi-select dropdown
- **Stub Code**: Auto-generated templates
- **Test Cases**: Optional initial test cases

---

## Code Execution

### Run Code

Quick execution with optional input:

```javascript
const runCode = async () => {
  const response = await fetch('/api/run', {
    method: 'POST',
    body: JSON.stringify({
      language,
      files: { [getMainFileName()]: code },
      input: customInput
    })
  })
  const result = await response.json()
  setResult(result)
}
```

### Submit Code

Full evaluation against all test cases:

```javascript
const submitCode = async () => {
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify({
      problemId: selectedProblem.ID,
      language,
      files: { [getMainFileName()]: code }
    })
  })
  const result = await response.json()
  setResult(result)
}
```

### Results Display

- **Verdict**: Accepted/Rejected/Error
- **Test Cases**: Individual test results
- **Execution Time**: Time per test
- **Error Messages**: Detailed error info
- **Color Coding**: Green (pass), Red (fail)

---

## AI Question Generator

### UI Components

- **Modal**: Full-screen or dialog modal
- **Form Fields**:
  - Company name
  - Role selection (dropdown + custom)
  - Level selection
  - Question count
  - Provider selection
  - API key input
  - Job description (optional)
  - Company description (optional)
  - Interview type (optional)

### Generation Flow

1. **User Input**: Fill form fields
2. **Validation**: Check required fields
3. **API Call**: POST to `/api/agent/generate`
4. **Loading State**: Show spinner
5. **Results**: Display generated problems
6. **Auto-refresh**: Update problem list

### Integration

See [AI_QUESTION_GENERATION.md](./AI_QUESTION_GENERATION.md) for backend details.

---

## Jupyter Mode

### Features

- **Cell-based**: Multiple code cells
- **Individual Execution**: Run single cells
- **Run All**: Execute all cells sequentially
- **Clear All**: Clear all outputs
- **Output Display**: Results below each cell
- **Data Upload**: Upload datasets in Jupyter mode

### Cell Management

```javascript
const [cells, setCells] = useState([
  { id: 1, code: '', output: '', error: '' }
])

const addCell = () => {
  setCells([...cells, { id: Date.now(), code: '', output: '', error: '' }])
}

const removeCell = (id) => {
  setCells(cells.filter(cell => cell.id !== id))
}
```

### Cell Execution

Each cell executes independently, with output displayed below the cell.

---

## File Upload System

### Upload Data

- **Button**: "Upload Data" in Jupyter mode
- **File Selection**: Standard file picker
- **Supported Types**: CSV, JSON, TXT, XLSX, etc.
- **Progress**: Upload progress indicator
- **File List**: Display uploaded files

### File Management

- **List Files**: GET `/api/problem/{id}/files`
- **Delete File**: DELETE `/api/problem/{id}/files/{filename}`
- **File Display**: Show file name, size, type

### Integration

Uploaded files are available during code execution in the problem's upload directory.

---

## Styling & Theming

### Theme System

```javascript
const theme = {
  background: isDarkMode ? '#1a1a1a' : '#ffffff',
  text: isDarkMode ? '#e0e0e0' : '#333333',
  primary: '#4a90e2',
  accent: '#50c878',
  border: '#cccccc',
  // ... more colors
}
```

### Dark Mode

- **Toggle Button**: Sun/Moon icon
- **Persistent**: Stored in localStorage
- **Smooth Transition**: CSS transitions
- **Complete Coverage**: All components themed

### Color Scheme

- **Light Mode**: White background, dark text
- **Dark Mode**: Dark background, light text
- **Accent Colors**: Blue for primary, green for success
- **Error Colors**: Red for failures

---

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Run code
- **Esc**: Close modals
- **Tab**: Code indentation
- **Ctrl/Cmd + S**: (Future: Save code)

---

## Error Handling

### Error Boundaries

```javascript
try {
  // API call
} catch (error) {
  setError(error.message)
  // Display error to user
}
```

### User Feedback

- **Error Messages**: Clear, user-friendly messages
- **Loading States**: Spinners during operations
- **Success Messages**: Confirmation for actions
- **Validation**: Form validation before submission

---

## Performance Optimization

### Code Splitting

- **Lazy Loading**: (Future enhancement)
- **Component Optimization**: React.memo where appropriate

### API Optimization

- **Debouncing**: (Future: for search)
- **Caching**: Problem list caching
- **Batch Requests**: (Future enhancement)

---

## Accessibility

### Current Features

- **Keyboard Navigation**: Tab through elements
- **Focus Indicators**: Visible focus states
- **Color Contrast**: Meets WCAG guidelines

### Future Enhancements

- **Screen Reader Support**: ARIA labels
- **High Contrast Mode**: Additional theme option
- **Font Size Controls**: User-adjustable text size

---

## Testing

### Manual Testing

- **Browser Testing**: Chrome, Firefox, Safari, Edge
- **Responsive Testing**: Various screen sizes
- **Feature Testing**: All features manually tested

### Future Testing

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Cypress or Playwright
- **E2E Tests**: Full user flow testing

---

## Troubleshooting

### Common Issues

**Issue**: Problems not loading
- **Cause**: Backend not running
- **Solution**: Check backend server status

**Issue**: Code execution fails
- **Cause**: Network error or backend issue
- **Solution**: Check network, verify backend logs

**Issue**: Theme not persisting
- **Cause**: localStorage not working
- **Solution**: Check browser settings

---

## Future Enhancements

1. **Code Autocomplete**: Language server integration
2. **Syntax Highlighting**: Advanced highlighting library
3. **Code Formatting**: Auto-format on save
4. **Collaborative Editing**: Real-time collaboration
5. **Progress Tracking**: User progress and statistics
6. **Social Features**: Share solutions, comments
7. **Mobile App**: React Native version

---

## Conclusion

The Frontend UI provides a modern, feature-rich interface for coding interview practice, combining powerful code editing, execution, and AI question generation in a beautiful, responsive design.

