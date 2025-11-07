import React, { useEffect, useState } from 'react'

const styles = {
  light: {
    primary: '#2563EB', // Modern blue
    secondary: '#F9FAFB', // Off-white
    accent: '#1E40AF', // Darker blue
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    codeBackground: '#FAFAFA'
  },
  dark: {
    primary: '#3B82F6', // Brighter blue for dark mode
    secondary: '#1F2937', // Dark grey
    accent: '#60A5FA', // Light blue
    background: '#111827',
    surface: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    codeBackground: '#1E1E1E'
  }
}

const Editor = ({ value, onChange, theme, disabled }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    style={{
      width: '100%',
      height: '400px',
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '14px',
      lineHeight: '1.6',
      padding: '16px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.background,
      color: theme.text,
      resize: 'vertical',
      outline: 'none',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
      transition: 'border-color 0.2s ease'
    }}
    placeholder="Write your code here..."
    onFocus={(e) => e.target.style.borderColor = theme.primary}
    onBlur={(e) => e.target.style.borderColor = theme.border}
  />
)

const LoadingSpinner = ({ theme }) => (
  <div style={{
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: `2px solid ${theme.border}`,
    borderTop: `2px solid ${theme.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }} />
)

const TestResult = ({ test, index, theme }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'AC': return theme.success
      case 'WA': return theme.error
      case 'TLE': return '#FFA500' // Orange
      case 'RE': return theme.error
      case 'IE': return theme.error
      default: return theme.textSecondary
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'AC': return 'Accepted'
      case 'WA': return 'Wrong Answer'
      case 'TLE': return 'Time Limit Exceeded'
      case 'RE': return 'Runtime Error'
      case 'IE': return 'Internal Error'
      default: return status
    }
  }

  return (
    <tr style={{
      borderBottom: `1px solid ${theme.border}`,
      backgroundColor: test.status === 'AC' ? `${theme.success}08` : 'transparent'
    }}>
      <td style={{ padding: '12px', color: theme.text, fontWeight: '500' }}>{test.name}</td>
      <td style={{ padding: '12px' }}>
        <span style={{
          color: getStatusColor(test.status),
          fontWeight: 'bold',
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: `${getStatusColor(test.status)}15`,
          border: `1px solid ${getStatusColor(test.status)}25`
        }}>
          {getStatusText(test.status)}
        </span>
      </td>
      <td style={{
        padding: '12px',
        color: theme.textSecondary,
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        {test.time_ms}ms
      </td>
      <td style={{
        padding: '12px',
        color: test.message ? theme.error : theme.success,
        fontSize: '12px',
        maxWidth: '300px',
        wordWrap: 'break-word'
      }}>
        {test.message || 'Passed'}
      </td>
    </tr>
  )
}

// Error boundary component for safe rendering
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          border: '1px solid #ef5350',
          borderRadius: '4px',
          margin: '10px 0'
        }}>
          <h3>Something went wrong</h3>
          <p>An error occurred while rendering this section. Please refresh the page.</p>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

// Custom hook for safe array state management
const useSafeArrayState = (initialValue = []) => {
  const [state, setState] = useState(Array.isArray(initialValue) ? initialValue : [])
  
  const setSafeState = (newValue) => {
    if (Array.isArray(newValue)) {
      setState(newValue)
    } else if (newValue === null || newValue === undefined) {
      console.warn('Attempted to set null/undefined to array state, using empty array instead')
      setState([])
    } else {
      console.warn('Attempted to set non-array to array state:', typeof newValue, newValue)
      setState([])
    }
  }
  
  return [state, setSafeState]
}

// Safe array access helper function
const safeArrayAccess = (array, operation = 'length') => {
  if (!Array.isArray(array)) {
    console.warn(`Attempted to access ${operation} on non-array:`, typeof array, array)
    return operation === 'length' ? 0 : []
  }
  return operation === 'length' ? array.length : array
}

// Language configuration for universal file handling
const LANGUAGE_CONFIG = {
  python: { extension: 'py', fileName: 'Main.py' },
  cpp: { extension: 'cpp', fileName: 'Main.cpp' },
  c: { extension: 'cpp', fileName: 'Main.cpp' }, // C uses .cpp for simplicity
  java: { extension: 'java', fileName: 'Main.java' },
  kotlin: { extension: 'kt', fileName: 'Main.kt' },
  scala: { extension: 'scala', fileName: 'Main.scala' },
  go: { extension: 'go', fileName: 'main.go' },
  rust: { extension: 'rs', fileName: 'main.rs' },
  swift: { extension: 'swift', fileName: 'main.swift' },
  ruby: { extension: 'rb', fileName: 'main.rb' },
  javascript: { extension: 'js', fileName: 'main.js' },
  typescript: { extension: 'ts', fileName: 'main.ts' },
  bash: { extension: 'sh', fileName: 'script.sh' },
  sh: { extension: 'sh', fileName: 'script.sh' },
  sql: { extension: 'txt', fileName: 'code.txt' }
}

// Get file name for a given language
const getFileNameForLanguage = (language) => {
  return LANGUAGE_CONFIG[language]?.fileName || 'code.txt'
}

// Get default stub code for a language when problem doesn't provide one
const getDefaultStubForLanguage = (language) => {
  const stubs = {
    python: '# Write your solution here\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}',
    kotlin: 'fun main() {\n    // Write your solution here\n}',
    scala: 'object Main {\n  def main(args: Array[String]): Unit = {\n    // Write your solution here\n  }\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n}',
    rust: 'fn main() {\n    // Write your solution here\n}',
    swift: '// Write your solution here\n// Note: Use print() for output, avoid Foundation imports for compatibility',
    ruby: '# Write your solution here\n',
    javascript: '// Write your solution here\n',
    typescript: '// Write your TypeScript solution here\n// Note: Basic Node.js globals are available\n',
    bash: '#!/bin/bash\n# Write your solution here\n',
    sh: '#!/bin/sh\n# Write your solution here\n',
    sql: '-- Write your SQL query here\n'
  }
  return stubs[language] || '// Write your solution here\n'
}

export default function App() {
  const [problems, setProblems] = useState([])
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    const saved = localStorage.getItem('ceesarcode-dark-mode')
    return saved ? JSON.parse(saved) : false
  })
  const [isLoadingProblems, setIsLoadingProblems] = useState(true)
  const [isLoadingProblem, setIsLoadingProblem] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isBackendConnected, setIsBackendConnected] = useState(true)
  const [showCreateProblem, setShowCreateProblem] = useState(false)
  const [newProblem, setNewProblem] = useState({
    title: '',
    statement: '',
    languages: ['python'],
    stub: { python: '' }
  })
  const [isSubmittingCode, setIsSubmittingCode] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useSafeArrayState([])
  const [isJupyterMode, setIsJupyterMode] = useState(false)
  const [jupyterCells, setJupyterCells] = useState([
    { id: 1, code: '', output: '', isRunning: false, hasExecuted: false }
  ])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showAgent, setShowAgent] = useState(false)
  const [agentRequest, setAgentRequest] = useState({
    company: '',
    role: '',
    customRole: '',
    level: 'mid',
    count: 3,
    jobDescription: '',
    companyDescription: ''
  })
  const [useCustomRole, setUseCustomRole] = useState(false)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [agentResult, setAgentResult] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('ceesarcode-sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('ceesarcode-sidebar-width')
    return saved ? parseInt(saved) : 320
  })
  const [editorHeight, setEditorHeight] = useState(() => {
    const saved = localStorage.getItem('ceesarcode-editor-height')
    return saved ? parseInt(saved) : 450
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isResizingEditor, setIsResizingEditor] = useState(false)
  const [leftPaneWidth, setLeftPaneWidth] = useState(() => {
    const saved = localStorage.getItem('ceesarcode-left-pane-width')
    return saved ? parseFloat(saved) : 45
  })
  const [consoleHeight, setConsoleHeight] = useState(() => {
    const saved = localStorage.getItem('ceesarcode-console-height')
    return saved ? parseInt(saved) : 200
  })
  const [consoleCollapsed, setConsoleCollapsed] = useState(() => {
    const saved = localStorage.getItem('ceesarcode-console-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const [isResizingPanes, setIsResizingPanes] = useState(false)
  const [isResizingConsole, setIsResizingConsole] = useState(false)
  
  // Ref for code textarea to handle auto-resize
  const codeTextareaRef = React.useRef(null)

  // Auto-resize textarea to fit content (for shared scroll container)
  useEffect(() => {
    const updateEditorHeight = () => {
      if (codeTextareaRef.current) {
        const textarea = codeTextareaRef.current
        const scrollContainer = textarea.parentElement.parentElement
        const lineNumbersDiv = textarea.previousElementSibling
        
        if (scrollContainer && lineNumbersDiv) {
          // Reset height to auto to get accurate scrollHeight (accounts for wrapped text)
          textarea.style.height = 'auto'
          lineNumbersDiv.style.height = 'auto'
          
          // Force a reflow to ensure accurate scrollHeight calculation
          void textarea.offsetHeight
          
          // Get the actual content height needed (includes wrapped lines)
          const contentHeight = textarea.scrollHeight
          const containerHeight = scrollContainer.clientHeight
          
          // Set textarea height to show all content
          // Ensure it's at least as tall as the container for proper scrolling
          const finalHeight = Math.max(contentHeight, containerHeight)
          textarea.style.height = finalHeight + 'px'
          
          // Match line numbers div height exactly
          lineNumbersDiv.style.height = finalHeight + 'px'
        }
      }
    }
    
    // Update immediately
    updateEditorHeight()
    
    // Also update after a short delay to account for any layout changes
    const timeoutId = setTimeout(updateEditorHeight, 50)
    
    // Add resize observer to handle window/container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateEditorHeight()
    })
    
    if (codeTextareaRef.current) {
      const scrollContainer = codeTextareaRef.current.parentElement?.parentElement
      if (scrollContainer) {
        resizeObserver.observe(scrollContainer)
      }
    }
    
    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
    }
  }, [code, consoleCollapsed, consoleHeight])

  // All supported languages
  const allSupportedLanguages = [
    'python', 'cpp', 'c', 'java', 'kotlin', 'scala', 'go', 'rust',
    'swift', 'ruby', 'javascript', 'typescript', 'bash', 'sh', 'sql'
  ]

  // Job levels and roles for the agent
  const jobLevels = [
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-level' },
    { value: 'senior', label: 'Senior' },
    { value: 'staff', label: 'Staff' },
    { value: 'principal', label: 'Principal' }
  ]

  const commonRoles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Engineer',
    'Machine Learning Engineer',
    'Mobile Developer',
    'QA Engineer',
    'Security Engineer'
  ]

  const theme = isDarkMode ? styles.dark : styles.light

  // Keyboard shortcut functions
  const toggleComment = () => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = code.substring(start, end)
    const lines = selectedText.split('\n')
    
    // Check if all lines are commented
    const isAllCommented = lines.every(line => {
      const trimmed = line.trim()
      return trimmed === '' || 
        (selectedLanguage === 'python' && trimmed.startsWith('#')) ||
        (['cpp', 'c', 'java', 'javascript', 'typescript', 'go', 'rust', 'swift', 'kotlin', 'scala'].includes(selectedLanguage) && trimmed.startsWith('//')) ||
        (['bash', 'sh'].includes(selectedLanguage) && trimmed.startsWith('#')) ||
        (selectedLanguage === 'sql' && trimmed.startsWith('--'))
    })

    let newText
    if (isAllCommented) {
      // Uncomment
      newText = lines.map(line => {
        const trimmed = line.trim()
        if (trimmed === '') return line
        
        if (selectedLanguage === 'python' && trimmed.startsWith('#')) {
          return line.replace(/^(\s*)#/, '$1')
        } else if (['cpp', 'c', 'java', 'javascript', 'typescript', 'go', 'rust', 'swift', 'kotlin', 'scala'].includes(selectedLanguage) && trimmed.startsWith('//')) {
          return line.replace(/^(\s*)\/\//, '$1')
        } else if (['bash', 'sh'].includes(selectedLanguage) && trimmed.startsWith('#')) {
          return line.replace(/^(\s*)#/, '$1')
        } else if (selectedLanguage === 'sql' && trimmed.startsWith('--')) {
          return line.replace(/^(\s*)--/, '$1')
        }
        return line
      }).join('\n')
    } else {
      // Comment
      newText = lines.map(line => {
        const trimmed = line.trim()
        if (trimmed === '') return line
        
        if (selectedLanguage === 'python') {
          return line.replace(/^(\s*)/, '$1# ')
        } else if (['cpp', 'c', 'java', 'javascript', 'typescript', 'go', 'rust', 'swift', 'kotlin', 'scala'].includes(selectedLanguage)) {
          return line.replace(/^(\s*)/, '$1// ')
        } else if (['bash', 'sh'].includes(selectedLanguage)) {
          return line.replace(/^(\s*)/, '$1# ')
        } else if (selectedLanguage === 'sql') {
          return line.replace(/^(\s*)/, '$1-- ')
        }
        return line
      }).join('\n')
    }

    const newCode = code.substring(0, start) + newText + code.substring(end)
    setCode(newCode)
    
    // Restore selection
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + newText.length)
    }, 0)
  }

  const formatCode = () => {
    // Enhanced formatting for all languages
    const lines = code.split('\n')
    const formattedLines = []
    let indentLevel = 0
    const indentSize = getIndentSize(selectedLanguage)
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      
      // Remove trailing whitespace
      line = line.replace(/\s+$/, '')
      
      // Calculate indentation based on language constructs
      const trimmedLine = line.trim()
      
      // Decrease indent for closing brackets/braces
      if (/^[}\]\)]/.test(trimmedLine)) {
        indentLevel = Math.max(0, indentLevel - 1)
      }
      
      // Apply current indentation
      const indent = ' '.repeat(indentLevel * indentSize)
      const formattedLine = indent + trimmedLine
      
      // Increase indent for opening brackets/braces and language constructs
      if (/[{\[\(]$/.test(trimmedLine) || checkLanguageConstructs(trimmedLine, selectedLanguage)) {
        indentLevel++
      }
      
      formattedLines.push(formattedLine)
    }
    
    setCode(formattedLines.join('\n'))
  }

  const clearCode = () => {
    if (window.confirm('Are you sure you want to clear all code?')) {
      setCode('')
    }
  }

  const duplicateLine = () => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const lines = code.split('\n')
    let currentLine = 0
    let charCount = 0

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1 // +1 for newline
    }

    const lineToDuplicate = lines[currentLine]
    lines.splice(currentLine + 1, 0, lineToDuplicate)
    setCode(lines.join('\n'))
  }

  const moveLineUp = () => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const lines = code.split('\n')
    let currentLine = 0
    let charCount = 0

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1
    }

    if (currentLine > 0) {
      [lines[currentLine - 1], lines[currentLine]] = [lines[currentLine], lines[currentLine - 1]]
      setCode(lines.join('\n'))
    }
  }

  const moveLineDown = () => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const lines = code.split('\n')
    let currentLine = 0
    let charCount = 0

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1
    }

    if (currentLine < lines.length - 1) {
      [lines[currentLine], lines[currentLine + 1]] = [lines[currentLine + 1], lines[currentLine]]
      setCode(lines.join('\n'))
    }
  }

  const deleteLine = () => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const lines = code.split('\n')
    let currentLine = 0
    let charCount = 0

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1
    }

    if (lines.length > 1) {
      lines.splice(currentLine, 1)
      setCode(lines.join('\n'))
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('ceesarcode-dark-mode', JSON.stringify(newDarkMode))
  }

  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed
    setSidebarCollapsed(newCollapsed)
    localStorage.setItem('ceesarcode-sidebar-collapsed', JSON.stringify(newCollapsed))
  }

  // Sidebar resize handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = Math.max(200, Math.min(600, e.clientX))
        setSidebarWidth(newWidth)
        localStorage.setItem('ceesarcode-sidebar-width', newWidth.toString())
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  // Editor height resize handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingEditor) {
        const editorContainer = document.querySelector('[data-editor-container]')
        if (editorContainer) {
          const rect = editorContainer.getBoundingClientRect()
          const newHeight = Math.max(200, Math.min(800, e.clientY - rect.top))
          setEditorHeight(newHeight)
          localStorage.setItem('ceesarcode-editor-height', newHeight.toString())
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizingEditor(false)
    }

    if (isResizingEditor) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingEditor])

  // Left/Right panes resize handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingPanes) {
        const container = document.querySelector('[data-panes-container]')
        if (container) {
          const rect = container.getBoundingClientRect()
          const newWidthPercent = ((e.clientX - rect.left) / rect.width) * 100
          const clampedWidth = Math.max(25, Math.min(75, newWidthPercent))
          setLeftPaneWidth(clampedWidth)
          localStorage.setItem('ceesarcode-left-pane-width', clampedWidth.toString())
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizingPanes(false)
    }

    if (isResizingPanes) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingPanes])

  // Console height resize handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingConsole) {
        const container = document.querySelector('[data-console-container]')
        if (container) {
          const rect = container.getBoundingClientRect()
          const newHeight = Math.max(100, Math.min(600, rect.bottom - e.clientY))
          setConsoleHeight(newHeight)
          localStorage.setItem('ceesarcode-console-height', newHeight.toString())
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizingConsole(false)
    }

    if (isResizingConsole) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingConsole])

  const toggleConsole = () => {
    const newCollapsed = !consoleCollapsed
    setConsoleCollapsed(newCollapsed)
    localStorage.setItem('ceesarcode-console-collapsed', JSON.stringify(newCollapsed))
  }

  const cycleLanguage = (direction = 1) => {
    const currentIndex = allSupportedLanguages.indexOf(selectedLanguage)
    const nextIndex = (currentIndex + direction + allSupportedLanguages.length) % allSupportedLanguages.length
    const newLanguage = allSupportedLanguages[nextIndex]
    setSelectedLanguage(newLanguage)
    
    // Load stub code for the new language
    if (selectedProblem && selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
      setCode(selectedProblem.Stub[newLanguage])
    } else {
      setCode(getDefaultStubForLanguage(newLanguage))
    }
  }

  const showKeyboardShortcuts = () => {
    setShowShortcuts(true)
  }

  const generateQuestions = async () => {
    // Validate that we have company and either role or customRole
    const role = useCustomRole ? agentRequest.customRole : agentRequest.role
    if (!agentRequest.company || !role) {
      alert('Please fill in both company and role fields')
      return
    }

    // Ensure count is valid
    const count = agentRequest.count && !isNaN(parseInt(agentRequest.count)) ? parseInt(agentRequest.count) : 3
    const requestData = {
      ...agentRequest,
      role: role, // Use the selected or custom role
      count: Math.max(1, Math.min(10, count))
    }

    setIsGeneratingQuestions(true)
    setAgentResult(null)
    setError(null)

    try {
      const response = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setAgentResult(result)

      if (result.status === 'success') {
        // Refresh the problems list to include the new generated problems
        const fetchProblems = async () => {
          try {
            const response = await fetch('/api/problems')
            if (!response.ok) throw new Error('Failed to fetch problems')
            const data = await response.json()
            setProblems(data)
          } catch (err) {
            console.error('Error fetching problems:', err)
          }
        }
        await fetchProblems()
        const problemCount = result.problems ? result.problems.length : 0
        alert(`Successfully generated ${problemCount} questions!`)
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (err) {
      console.error('Error generating questions:', err)
      setError(err.message)
      alert('Failed to generate questions: ' + err.message)
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  // Tab completion and indentation functions
  const getLanguageKeywords = (language) => {
    const keywords = {
      python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with', 'import', 'from', 'return', 'yield', 'lambda', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None'],
      javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'import', 'export', 'async', 'await'],
      typescript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'import', 'export', 'async', 'await', 'interface', 'type', 'enum', 'namespace'],
      java: ['public', 'private', 'protected', 'static', 'final', 'abstract', 'class', 'interface', 'extends', 'implements', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super'],
      cpp: ['int', 'float', 'double', 'char', 'bool', 'void', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'new', 'delete', 'class', 'struct', 'public', 'private', 'protected'],
      c: ['int', 'float', 'double', 'char', 'void', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'return', 'struct', 'typedef', 'enum'],
      go: ['func', 'var', 'const', 'type', 'struct', 'interface', 'if', 'else', 'for', 'range', 'switch', 'case', 'break', 'continue', 'return', 'go', 'chan', 'select', 'defer', 'panic', 'recover'],
      rust: ['fn', 'let', 'const', 'static', 'if', 'else', 'for', 'while', 'loop', 'match', 'break', 'continue', 'return', 'struct', 'enum', 'impl', 'trait', 'use', 'mod', 'pub', 'async', 'await'],
      kotlin: ['fun', 'val', 'var', 'class', 'interface', 'if', 'else', 'for', 'while', 'when', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'data', 'object', 'companion'],
      scala: ['def', 'val', 'var', 'class', 'object', 'trait', 'if', 'else', 'for', 'while', 'match', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'import', 'package'],
      swift: ['func', 'let', 'var', 'class', 'struct', 'enum', 'protocol', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'import'],
      ruby: ['def', 'class', 'module', 'if', 'else', 'elsif', 'for', 'while', 'case', 'when', 'break', 'next', 'return', 'begin', 'rescue', 'ensure', 'raise', 'yield', 'end'],
      bash: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'break', 'continue', 'echo', 'read', 'cd', 'ls', 'grep', 'awk', 'sed'],
      sql: ['SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER']
    }
    return keywords[language] || []
  }

  const handleTabKey = (e) => {
    e.preventDefault()
    const textarea = e.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentLine = code.substring(0, start).split('\n').pop()
    const currentWord = currentLine.split(/\s+/).pop() || ''
    
    if (e.shiftKey) {
      // Shift+Tab: Remove indentation
      handleReverseTab(textarea, start, end)
    } else {
      // Tab: Smart indentation or completion
      if (currentWord.length > 0 && !currentWord.includes('\n')) {
        // Try tab completion
        const completion = tryTabCompletion(currentWord, selectedLanguage)
        if (completion) {
          const newCode = code.substring(0, start - currentWord.length) + completion + code.substring(end)
          setCode(newCode)
          setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start - currentWord.length + completion.length, start - currentWord.length + completion.length)
          }, 0)
        } else {
          // Add indentation
          handleTabIndentation(textarea, start, end)
        }
      } else {
        // Add indentation
        handleTabIndentation(textarea, start, end)
      }
    }
  }

  const handleTabIndentation = (textarea, start, end) => {
    const lines = code.split('\n')
    let currentLine = 0
    let charCount = 0

    // Find current line
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1
    }

    const indentSize = getIndentSize(selectedLanguage)
    const indent = ' '.repeat(indentSize)

    if (start === end) {
      // Single cursor - add indentation at cursor position
      const newCode = code.substring(0, start) + indent + code.substring(end)
      setCode(newCode)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + indent.length, start + indent.length)
      }, 0)
    } else {
      // Selection - indent all selected lines
      const selectedLines = []
      let lineStart = 0
      
      for (let i = 0; i < lines.length; i++) {
        const lineEnd = lineStart + lines[i].length
        if (lineEnd >= start && lineStart <= end) {
          selectedLines.push(i)
        }
        lineStart = lineEnd + 1
      }

      const newLines = [...lines]
      selectedLines.forEach(lineIndex => {
        newLines[lineIndex] = indent + newLines[lineIndex]
      })

      setCode(newLines.join('\n'))
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + indent.length, end + indent.length * selectedLines.length)
      }, 0)
    }
  }

  const handleReverseTab = (textarea, start, end) => {
    const lines = code.split('\n')
    let currentLine = 0
    let charCount = 0

    // Find current line
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1
    }

    const indentSize = getIndentSize(selectedLanguage)

    if (start === end) {
      // Single cursor - remove indentation at cursor position
      const currentLineText = lines[currentLine]
      const leadingSpaces = currentLineText.match(/^(\s*)/)[1]
      const spacesToRemove = Math.min(leadingSpaces.length, indentSize)
      
      if (spacesToRemove > 0) {
        const newCode = code.substring(0, start - spacesToRemove) + code.substring(start)
        setCode(newCode)
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start - spacesToRemove, start - spacesToRemove)
        }, 0)
      }
    } else {
      // Selection - unindent all selected lines
      const selectedLines = []
      let lineStart = 0
      
      for (let i = 0; i < lines.length; i++) {
        const lineEnd = lineStart + lines[i].length
        if (lineEnd >= start && lineStart <= end) {
          selectedLines.push(i)
        }
        lineStart = lineEnd + 1
      }

      const newLines = [...lines]
      let totalRemoved = 0
      
      selectedLines.forEach(lineIndex => {
        const leadingSpaces = newLines[lineIndex].match(/^(\s*)/)[1]
        const spacesToRemove = Math.min(leadingSpaces.length, indentSize)
        newLines[lineIndex] = newLines[lineIndex].substring(spacesToRemove)
        totalRemoved += spacesToRemove
      })

      setCode(newLines.join('\n'))
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(Math.max(0, start - indentSize), Math.max(0, end - totalRemoved))
      }, 0)
    }
  }

  const getIndentSize = (language) => {
    const indentSizes = {
      python: 4,
      javascript: 2,
      typescript: 2,
      java: 4,
      cpp: 4,
      c: 4,
      go: 4,
      rust: 4,
      kotlin: 4,
      scala: 2,
      swift: 4,
      ruby: 2,
      bash: 2,
      sh: 2,
      sql: 2
    }
    return indentSizes[language] || 4
  }

  const handleEnterKey = (e) => {
    e.preventDefault()
    const textarea = e.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Get current line and previous line
    const lines = code.split('\n')
    let currentLine = 0
    let charCount = 0
    
    // Find current line
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1
    }
    
    const currentLineText = lines[currentLine] || ''
    const prevLineText = lines[currentLine - 1] || ''
    
    // Calculate indentation for new line
    let newIndent = ''
    
    // Get current line indentation
    const currentIndent = currentLineText.match(/^(\s*)/)[1]
    
    // Check if current line ends with opening bracket/parenthesis
    const trimmedCurrent = currentLineText.trim()
    const endsWithOpen = /[{\[\(]$/.test(trimmedCurrent)
    
    // Check if current line starts with closing bracket/parenthesis
    const startsWithClose = /^\s*[}\]\)]/.test(currentLineText)
    
    // Check for language-specific constructs that need indentation
    const needsIndent = checkLanguageConstructs(trimmedCurrent, selectedLanguage)
    
    // Check if previous line has indentation
    const prevIndent = prevLineText.match(/^(\s*)/)[1]
    
    if (endsWithOpen) {
      // Increase indentation for opening brackets
      const indentSize = getIndentSize(selectedLanguage)
      newIndent = currentIndent + ' '.repeat(indentSize)
    } else if (startsWithClose) {
      // Decrease indentation for closing brackets
      const indentSize = getIndentSize(selectedLanguage)
      const baseIndent = currentIndent.length >= indentSize ? 
        currentIndent.substring(0, currentIndent.length - indentSize) : ''
      newIndent = baseIndent
    } else if (needsIndent) {
      // Increase indentation for language constructs
      const indentSize = getIndentSize(selectedLanguage)
      newIndent = currentIndent + ' '.repeat(indentSize)
    } else {
      // Keep same indentation as current line
      newIndent = currentIndent
    }
    
    // Insert newline with proper indentation
    const newCode = code.substring(0, start) + '\n' + newIndent + code.substring(end)
    setCode(newCode)
    
    // Set cursor position after indentation
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 1 + newIndent.length, start + 1 + newIndent.length)
    }, 0)
  }

  const checkLanguageConstructs = (line, language) => {
    // Check for language-specific constructs that need indentation
    const constructs = {
      python: [
        /:\s*$/,  // Colon at end (if, for, while, def, class, etc.)
        /^\s*(if|for|while|def|class|with|try|except|finally|elif|else)\s+.*:\s*$/,
        /^\s*(async\s+)?def\s+\w+.*:\s*$/,
        /^\s*class\s+\w+.*:\s*$/
      ],
      javascript: [
        /:\s*$/,  // Colon at end (object literal, switch case)
        /^\s*(if|for|while|function|switch|try|catch|finally)\s*\(.*\)\s*\{?\s*$/,
        /^\s*(const|let|var)\s+\w+\s*=\s*\(.*\)\s*=>\s*\{?\s*$/,
        /^\s*\w+\s*:\s*function\s*\(.*\)\s*\{?\s*$/
      ],
      typescript: [
        /:\s*$/,  // Colon at end
        /^\s*(if|for|while|function|switch|try|catch|finally)\s*\(.*\)\s*\{?\s*$/,
        /^\s*(const|let|var)\s+\w+\s*:\s*\w+\s*=\s*\(.*\)\s*=>\s*\{?\s*$/,
        /^\s*(public|private|protected)\s+\w+\s*\(.*\)\s*:\s*\w+\s*\{?\s*$/
      ],
      java: [
        /^\s*(if|for|while|switch|try|catch|finally)\s*\(.*\)\s*\{?\s*$/,
        /^\s*(public|private|protected)\s+\w+\s+.*\s*\(.*\)\s*\{?\s*$/,
        /^\s*class\s+\w+.*\{?\s*$/
      ],
      cpp: [
        /^\s*(if|for|while|switch|try|catch)\s*\(.*\)\s*\{?\s*$/,
        /^\s*\w+\s+.*\s*\(.*\)\s*\{?\s*$/,
        /^\s*class\s+\w+.*\{?\s*$/
      ],
      c: [
        /^\s*(if|for|while|switch)\s*\(.*\)\s*\{?\s*$/,
        /^\s*\w+\s+.*\s*\(.*\)\s*\{?\s*$/
      ],
      go: [
        /^\s*(if|for|switch|func)\s+.*\{?\s*$/,
        /^\s*func\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      rust: [
        /^\s*(if|for|while|match|fn)\s+.*\{?\s*$/,
        /^\s*fn\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      kotlin: [
        /^\s*(if|for|while|when|try|catch|finally)\s+.*\{?\s*$/,
        /^\s*fun\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      scala: [
        /^\s*(if|for|while|match|try|catch|finally)\s+.*\{?\s*$/,
        /^\s*def\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      swift: [
        /^\s*(if|for|while|switch|func)\s+.*\{?\s*$/,
        /^\s*func\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      ruby: [
        /^\s*(if|for|while|def|class|module|begin|rescue|ensure)\s+.*$/,
        /^\s*def\s+\w+.*$/,
        /^\s*class\s+\w+.*$/
      ],
      bash: [
        /^\s*(if|for|while|case|function)\s+.*$/,
        /^\s*\w+\s*\(\s*\)\s*\{?\s*$/
      ],
      sql: [
        /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+.*$/,
        /^\s*(WHERE|FROM|JOIN|GROUP BY|ORDER BY|HAVING)\s+.*$/
      ]
    }
    
    const languageConstructs = constructs[language] || []
    return languageConstructs.some(pattern => pattern.test(line))
  }

  const handleKeyDown = (e) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      handleTabKey(e)
      return
    }
    
    // Handle Enter key for auto-indentation
    if (e.key === 'Enter') {
      handleEnterKey(e)
      return
    }
    
    // Handle Backspace for smart deletion
    if (e.key === 'Backspace') {
      handleSmartBackspace(e)
      return
    }
    
    // Handle auto-closing brackets and parentheses
    if (['(', '[', '{', '"', "'"].includes(e.key)) {
      handleAutoClose(e)
      return
    }
    
    // Handle Ctrl/Cmd + Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (selectedProblem && code.trim() && !isRunning) {
        runCode()
      }
      return
    }
    
    // Handle Ctrl/Cmd + / for comment toggle
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      toggleComment()
      return
    }
    
    // Handle Ctrl/Cmd + D for duplicate line
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault()
      duplicateLine()
      return
    }
    
    // Handle Ctrl/Cmd + L for clear code
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault()
      clearCode()
      return
    }
    
    // Handle Ctrl/Cmd + Shift + F for format code
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault()
      formatCode()
      return
    }
    
    // Handle Escape to go back to problems list
    if (e.key === 'Escape' && selectedProblem) {
      setSelectedProblem(null)
      return
    }
    
    // Handle Ctrl/Cmd + Shift + ? for shortcuts
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
      e.preventDefault()
      setShowShortcuts(true)
      return
    }
  }

  const handleSmartBackspace = (e) => {
    const textarea = e.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // If there's a selection, just delete it normally
    if (start !== end) {
      return
    }
    
    // Check if we're deleting a bracket/parenthesis that has a matching pair
    const beforeCursor = code.substring(0, start)
    const afterCursor = code.substring(end)
    
    const bracketPairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    }
    
    // Check if the character before cursor is an opening bracket
    const charBefore = beforeCursor.charAt(beforeCursor.length - 1)
    const matchingClose = bracketPairs[charBefore]
    
    if (matchingClose && afterCursor.charAt(0) === matchingClose) {
      // Delete both opening and closing brackets
      e.preventDefault()
      const newCode = code.substring(0, start - 1) + code.substring(end + 1)
      setCode(newCode)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start - 1, start - 1)
      }, 0)
      return
    }
    
    // Check if we're at the beginning of an indented line
    const lines = code.split('\n')
    let currentLine = 0
    let charCount = 0
    
    // Find current line
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i
        break
      }
      charCount += lines[i].length + 1
    }
    
    const currentLineText = lines[currentLine] || ''
    const currentIndent = currentLineText.match(/^(\s*)/)[1]
    
    // Check if cursor is at the beginning of indentation
    const cursorInLine = start - charCount
    if (cursorInLine <= currentIndent.length && currentIndent.length > 0) {
      // We're at the beginning of indentation, smart unindent
      e.preventDefault()
      
      // Find previous logical indentation level
      const prevIndentLevel = findPreviousIndentLevel(lines, currentLine, selectedLanguage)
      const indentSize = getIndentSize(selectedLanguage)
      const newIndent = ' '.repeat(prevIndentLevel * indentSize)
      
      // Replace current line with new indentation
      const newLineText = newIndent + currentLineText.trim()
      const newLines = [...lines]
      newLines[currentLine] = newLineText
      
      setCode(newLines.join('\n'))
      
      // Set cursor position after new indentation
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = charCount + newIndent.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
      return
    }
  }

  const findPreviousIndentLevel = (lines, currentLine, language) => {
    const indentSize = getIndentSize(language)
    const currentIndent = lines[currentLine].match(/^(\s*)/)[1]
    const currentIndentLevel = Math.floor(currentIndent.length / indentSize)
    
    // If we're already at base level, stay there
    if (currentIndentLevel <= 1) {
      return 0
    }
    
    // Look backwards through lines to find the previous logical indentation level
    for (let i = currentLine - 1; i >= 0; i--) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      if (trimmedLine === '') continue
      
      const lineIndent = line.match(/^(\s*)/)[1]
      const lineIndentLevel = Math.floor(lineIndent.length / indentSize)
      
      // If this line has less indentation than current, it's a good candidate
      if (lineIndentLevel < currentIndentLevel) {
        return lineIndentLevel
      }
    }
    
    // If no previous level found, go to base level (0)
    return 0
  }

  const isLogicalBlockStart = (line, language) => {
    // Check if line represents a logical block start that should have content indented under it
    const blockStartPatterns = {
      python: [
        /^\s*(if|for|while|def|class|with|try|except|finally|elif|else)\s+.*:\s*$/,
        /^\s*(async\s+)?def\s+\w+.*:\s*$/,
        /^\s*class\s+\w+.*:\s*$/
      ],
      javascript: [
        /^\s*(if|for|while|function|switch|try|catch|finally)\s*\(.*\)\s*\{?\s*$/,
        /^\s*(const|let|var)\s+\w+\s*=\s*\(.*\)\s*=>\s*\{?\s*$/,
        /^\s*\w+\s*:\s*function\s*\(.*\)\s*\{?\s*$/,
        /^\s*class\s+\w+.*\{?\s*$/
      ],
      typescript: [
        /^\s*(if|for|while|function|switch|try|catch|finally)\s*\(.*\)\s*\{?\s*$/,
        /^\s*(const|let|var)\s+\w+\s*:\s*\w+\s*=\s*\(.*\)\s*=>\s*\{?\s*$/,
        /^\s*(public|private|protected)\s+\w+\s*\(.*\)\s*:\s*\w+\s*\{?\s*$/,
        /^\s*class\s+\w+.*\{?\s*$/
      ],
      java: [
        /^\s*(if|for|while|switch|try|catch|finally)\s*\(.*\)\s*\{?\s*$/,
        /^\s*(public|private|protected)\s+\w+\s+.*\s*\(.*\)\s*\{?\s*$/,
        /^\s*class\s+\w+.*\{?\s*$/
      ],
      cpp: [
        /^\s*(if|for|while|switch|try|catch)\s*\(.*\)\s*\{?\s*$/,
        /^\s*\w+\s+.*\s*\(.*\)\s*\{?\s*$/,
        /^\s*class\s+\w+.*\{?\s*$/
      ],
      c: [
        /^\s*(if|for|while|switch)\s*\(.*\)\s*\{?\s*$/,
        /^\s*\w+\s+.*\s*\(.*\)\s*\{?\s*$/
      ],
      go: [
        /^\s*(if|for|switch|func)\s+.*\{?\s*$/,
        /^\s*func\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      rust: [
        /^\s*(if|for|while|match|fn)\s+.*\{?\s*$/,
        /^\s*fn\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      kotlin: [
        /^\s*(if|for|while|when|try|catch|finally)\s+.*\{?\s*$/,
        /^\s*fun\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      scala: [
        /^\s*(if|for|while|match|try|catch|finally)\s+.*\{?\s*$/,
        /^\s*def\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      swift: [
        /^\s*(if|for|while|switch|func)\s+.*\{?\s*$/,
        /^\s*func\s+\w+.*\s*\(.*\)\s*\{?\s*$/
      ],
      ruby: [
        /^\s*(if|for|while|def|class|module|begin|rescue|ensure)\s+.*$/,
        /^\s*def\s+\w+.*$/,
        /^\s*class\s+\w+.*$/
      ],
      bash: [
        /^\s*(if|for|while|case|function)\s+.*$/,
        /^\s*\w+\s*\(\s*\)\s*\{?\s*$/
      ],
      sql: [
        /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+.*$/,
        /^\s*(WHERE|FROM|JOIN|GROUP BY|ORDER BY|HAVING)\s+.*$/
      ]
    }
    
    const patterns = blockStartPatterns[language] || []
    return patterns.some(pattern => pattern.test(line))
  }

  const handleAutoClose = (e) => {
    const textarea = e.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    const openingChars = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    }
    
    const closingChar = openingChars[e.key]
    if (!closingChar) return
    
    // Check if we're already inside quotes
    if (e.key === '"' || e.key === "'") {
      const beforeCursor = code.substring(0, start)
      const afterCursor = code.substring(end)
      
      // Count unescaped quotes before cursor
      let quoteCount = 0
      let i = beforeCursor.length - 1
      while (i >= 0) {
        if (beforeCursor[i] === e.key && (i === 0 || beforeCursor[i-1] !== '\\')) {
          quoteCount++
        }
        i--
      }
      
      // If we're inside quotes, just insert the quote
      if (quoteCount % 2 === 1) {
        e.preventDefault()
        const newCode = code.substring(0, start) + e.key + code.substring(end)
        setCode(newCode)
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + 1, start + 1)
        }, 0)
        return
      }
    }
    
    // Check if next character is already the closing character
    const afterCursor = code.substring(end)
    if (afterCursor.charAt(0) === closingChar) {
      // Just move cursor past the existing closing character
      e.preventDefault()
      const newCode = code.substring(0, start) + e.key + code.substring(end)
      setCode(newCode)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + 1, start + 1)
      }, 0)
      return
    }
    
    // Insert opening and closing characters
    e.preventDefault()
    const newCode = code.substring(0, start) + e.key + closingChar + code.substring(end)
    setCode(newCode)
    
    // Set cursor position between the brackets
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 1, start + 1)
    }, 0)
  }

  const tryTabCompletion = (word, language) => {
    const keywords = getLanguageKeywords(language)
    const matches = keywords.filter(keyword => 
      keyword.toLowerCase().startsWith(word.toLowerCase()) && keyword.toLowerCase() !== word.toLowerCase()
    )
    
    if (matches.length === 1) {
      return matches[0]
    } else if (matches.length > 1) {
      // Find common prefix
      const commonPrefix = findCommonPrefix(matches)
      if (commonPrefix.length > word.length) {
        return commonPrefix
      }
    }
    
    // Try template completion for common patterns
    const templates = getLanguageTemplates(language)
    const templateMatch = templates.find(template => 
      template.trigger.toLowerCase().startsWith(word.toLowerCase())
    )
    
    if (templateMatch) {
      return templateMatch.template
    }
    
    return null
  }

  const getLanguageTemplates = (language) => {
    const templates = {
      python: [
        { trigger: 'if', template: 'if ${1:condition}:\n    ${2:pass}' },
        { trigger: 'for', template: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}' },
        { trigger: 'while', template: 'while ${1:condition}:\n    ${2:pass}' },
        { trigger: 'def', template: 'def ${1:function_name}(${2:params}):\n    ${3:pass}' },
        { trigger: 'class', template: 'class ${1:ClassName}:\n    ${2:pass}' },
        { trigger: 'try', template: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}' },
        { trigger: 'with', template: 'with ${1:resource} as ${2:name}:\n    ${3:pass}' }
      ],
      javascript: [
        { trigger: 'if', template: 'if (${1:condition}) {\n    ${2:// code}\n}' },
        { trigger: 'for', template: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n    ${3:// code}\n}' },
        { trigger: 'while', template: 'while (${1:condition}) {\n    ${2:// code}\n}' },
        { trigger: 'function', template: 'function ${1:functionName}(${2:params}) {\n    ${3:// code}\n}' },
        { trigger: 'arrow', template: '(${1:params}) => {\n    ${2:// code}\n}' },
        { trigger: 'class', template: 'class ${1:ClassName} {\n    ${2:// code}\n}' },
        { trigger: 'try', template: 'try {\n    ${1:// code}\n} catch (${2:error}) {\n    ${3:// handle error}\n}' }
      ],
      typescript: [
        { trigger: 'if', template: 'if (${1:condition}) {\n    ${2:// code}\n}' },
        { trigger: 'for', template: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n    ${3:// code}\n}' },
        { trigger: 'function', template: 'function ${1:functionName}(${2:params}): ${3:returnType} {\n    ${4:// code}\n}' },
        { trigger: 'arrow', template: '(${1:params}): ${2:returnType} => {\n    ${3:// code}\n}' },
        { trigger: 'class', template: 'class ${1:ClassName} {\n    ${2:// code}\n}' },
        { trigger: 'interface', template: 'interface ${1:InterfaceName} {\n    ${2:// properties}\n}' }
      ],
      java: [
        { trigger: 'if', template: 'if (${1:condition}) {\n    ${2:// code}\n}' },
        { trigger: 'for', template: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n    ${3:// code}\n}' },
        { trigger: 'while', template: 'while (${1:condition}) {\n    ${2:// code}\n}' },
        { trigger: 'class', template: 'public class ${1:ClassName} {\n    ${2:// code}\n}' },
        { trigger: 'method', template: 'public ${1:void} ${2:methodName}(${3:params}) {\n    ${4:// code}\n}' },
        { trigger: 'try', template: 'try {\n    ${1:// code}\n} catch (${2:Exception} ${3:e}) {\n    ${4:// handle error}\n}' }
      ],
      cpp: [
        { trigger: 'if', template: 'if (${1:condition}) {\n    ${2:// code}\n}' },
        { trigger: 'for', template: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n    ${3:// code}\n}' },
        { trigger: 'while', template: 'while (${1:condition}) {\n    ${2:// code}\n}' },
        { trigger: 'class', template: 'class ${1:ClassName} {\n    ${2:// code}\n};' },
        { trigger: 'function', template: '${1:returnType} ${2:functionName}(${3:params}) {\n    ${4:// code}\n}' }
      ],
      go: [
        { trigger: 'if', template: 'if ${1:condition} {\n    ${2:// code}\n}' },
        { trigger: 'for', template: 'for ${1:i} := 0; ${1:i} < ${2:length}; ${1:i}++ {\n    ${3:// code}\n}' },
        { trigger: 'func', template: 'func ${1:functionName}(${2:params}) ${3:returnType} {\n    ${4:// code}\n}' },
        { trigger: 'struct', template: 'type ${1:StructName} struct {\n    ${2:// fields}\n}' }
      ],
      rust: [
        { trigger: 'if', template: 'if ${1:condition} {\n    ${2:// code}\n}' },
        { trigger: 'for', template: 'for ${1:item} in ${2:iterable} {\n    ${3:// code}\n}' },
        { trigger: 'fn', template: 'fn ${1:function_name}(${2:params}) -> ${3:return_type} {\n    ${4:// code}\n}' },
        { trigger: 'struct', template: 'struct ${1:StructName} {\n    ${2:// fields}\n}' }
      ]
    }
    
    return templates[language] || []
  }

  const findCommonPrefix = (strings) => {
    if (strings.length === 0) return ''
    if (strings.length === 1) return strings[0]
    
    let prefix = strings[0]
    for (let i = 1; i < strings.length; i++) {
      while (prefix.length > 0 && !strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
        prefix = prefix.slice(0, -1)
      }
    }
    return prefix
  }


  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      console.log('Pop state:', event.state)
      if (event.state) {
        const { problemId } = event.state
        if (problemId) {
          // Just select the problem
          const problem = problems.find(p => p.ID === problemId)
          if (problem) {
            setSelectedProblem(problem)
            setResult(null)
            setError(null)
            setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
          }
        } else {
          // Go back to problem list
          setSelectedProblem(null)
          setResult(null)
          setError(null)
          setJupyterCells([{ id: 1, code: '', output: '', isRunning: false }])
        }
      } else {
        // No state means we're at the root/home page
        setSelectedProblem(null)
        setResult(null)
        setError(null)
        setJupyterCells([{ id: 1, code: '', output: '', isRunning: false }])
        setShowCreateProblem(false)
        // Ensure URL is clean for home page
        if (window.location.hash) {
          window.history.replaceState({ page: 'home' }, '', '/')
        }
      }
    }

    // Initialize home state on app load
    if (!window.history.state) {
      window.history.replaceState({ page: 'home' }, '', '/')
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [problems])


  const handleFileUpload = async (event) => {
    if (!selectedProblem) {
      alert('Please select a problem first')
      return
    }

    const files = Array.from(event.target.files)
    const uploadedFilesData = []

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('problemId', selectedProblem.ID)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          uploadedFilesData.push({
            name: file.name,
            size: file.size,
            type: file.type
          })
        }
      } catch (err) {
        console.error('Upload failed:', err)
        alert(`Failed to upload ${file.name}`)
      }
    }

    if (uploadedFilesData.length > 0) {
      // Safely merge uploaded files with existing ones
      const currentFiles = Array.isArray(uploadedFiles) ? uploadedFiles : []
      const newFiles = Array.isArray(uploadedFilesData) ? uploadedFilesData : []
      setUploadedFiles([...currentFiles, ...newFiles])
      alert(`${newFiles.length} file(s) uploaded successfully!`)
      // Refresh the uploaded files list to ensure consistency
      fetchUploadedFiles(selectedProblem.ID)
    }
  }

  const handleQuestionsUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const content = await file.text()
      const questions = JSON.parse(content)
      
      if (!Array.isArray(questions)) {
        alert('JSON file must contain an array of questions')
        return
      }

      let successCount = 0
      for (const question of questions) {
        try {
          const response = await fetch('/api/problems/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(question)
          })
          
          if (response.ok) {
            successCount++
          } else {
            console.error('Failed to create question:', question.title)
          }
        } catch (err) {
          console.error('Error creating question:', err)
        }
      }

      if (successCount > 0) {
        alert(`Successfully uploaded ${successCount} out of ${questions.length} questions!`)
        // Refresh the problems list
        const response = await fetch('/api/problems')
        if (response.ok) {
          const data = await response.json()
          setProblems(data)
        }
      } else {
        alert('Failed to upload any questions. Please check the JSON format.')
      }
    } catch (err) {
      console.error('Failed to parse JSON:', err)
      alert('Invalid JSON file. Please check the format.')
    }

    // Reset the file input
    event.target.value = ''
  }

  const removeUploadedFile = async (index) => {
    if (!selectedProblem) return

    const fileToRemove = uploadedFiles[index]
    try {
      const response = await fetch(`/api/problem/${selectedProblem.ID}/files/${fileToRemove.name}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Safely filter files, ensuring uploadedFiles is always an array
        const currentFiles = Array.isArray(uploadedFiles) ? uploadedFiles : []
        setUploadedFiles(currentFiles.filter((_, i) => i !== index))
      } else {
        alert(`Failed to delete ${fileToRemove.name}`)
      }
    } catch (err) {
      console.error('Failed to delete file:', err)
      alert(`Failed to delete ${fileToRemove.name}`)
    }
  }

  const fetchUploadedFiles = async (problemId) => {
    try {
      const response = await fetch(`/api/problem/${problemId}/files`)
      if (response.ok) {
        const files = await response.json()
        // Multiple safety checks to ensure files is always an array
        let safeFiles = []
        if (Array.isArray(files)) {
          safeFiles = files
        } else if (files && typeof files === 'object') {
          // If it's an object but not an array, try to convert or use empty array
          safeFiles = []
          console.warn('Expected array but got object for uploaded files:', files)
        } else if (files === null || files === undefined) {
          safeFiles = []
          console.warn('Received null/undefined for uploaded files, using empty array')
        } else {
          safeFiles = []
          console.warn('Unexpected data type for uploaded files:', typeof files, files)
        }
        setUploadedFiles(safeFiles)
      } else {
        // If response is not ok, set to empty array
        console.warn('Failed to fetch uploaded files, status:', response.status)
        setUploadedFiles([])
      }
    } catch (err) {
      console.error('Failed to fetch uploaded files:', err)
      // Always ensure uploadedFiles is an array even on error
      setUploadedFiles([])
    }
  }

  // Jupyter cell functions
  const addJupyterCell = () => {
    const newCell = {
      id: Date.now(),
      code: '',
      output: '',
      isRunning: false,
      hasExecuted: false
    }
    setJupyterCells([...jupyterCells, newCell])
  }

  const updateJupyterCell = (id, code) => {
    setJupyterCells(jupyterCells.map(cell =>
      cell.id === id ? { ...cell, code } : cell
    ))
  }

  const runAllJupyterCells = async () => {
    if (jupyterCells.length === 0) return

    // Mark all cells as running
    setJupyterCells(jupyterCells.map(cell => ({ ...cell, isRunning: true, output: '' })))

    for (let i = 0; i < jupyterCells.length; i++) {
      const cell = jupyterCells[i]
      if (!cell.code.trim()) continue

      try {
        // Get all previously executed cells up to this one
        const previousCells = jupyterCells.slice(0, i).filter(c => c.hasExecuted)

        let accumulatedCode = ''
        let files = {}

        // Create appropriate file based on selected language
        const fileName = getFileNameForLanguage(selectedLanguage)
        
        if (selectedLanguage === 'scala') {
          // For Scala, we can accumulate but it's more complex due to object-oriented nature
          // For now, just run the current cell
          files[fileName] = cell.code
        } else {
          // For most languages, accumulate code from previous cells
          accumulatedCode = previousCells.map(c => c.code).join('\n') + '\n' + cell.code
          files[fileName] = accumulatedCode
        }

        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId: selectedProblem?.ID || 'jupyter-cell',
            language: selectedLanguage,
            files: files
          })
        })

        const result = await response.json()

        let output = ''
        if (result.result) {
          output = result.result
        } else if (result.verdict === 'Accepted') {
          output = 'Cell executed successfully'
        } else if (result.error) {
          output = `Error: ${result.error}`
        } else if (result.tests && result.tests.length > 0) {
          const errorMsg = result.tests[0]?.message || 'Execution failed'
          output = `${errorMsg}`
        } else {
          output = 'Cell executed'
        }

        // Update cell with result
        setJupyterCells(prevCells =>
          prevCells.map(c =>
            c.id === cell.id ? { ...c, isRunning: false, output: output, hasExecuted: true } : c
          )
        )

        // Small delay between cells for better UX
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        setJupyterCells(prevCells =>
          prevCells.map(c =>
            c.id === cell.id ? { ...c, isRunning: false, output: `Error: ${error.message}` } : c
          )
        )
      }
    }
  }

  const clearAllJupyterOutputs = () => {
    setJupyterCells(jupyterCells.map(cell => ({ ...cell, output: '' })))
  }

  const runJupyterCell = async (id) => {
    const cell = jupyterCells.find(c => c.id === id)
    if (!cell) return

    // Update cell to show running state
    setJupyterCells(jupyterCells.map(c =>
      c.id === id ? { ...c, isRunning: true, output: '' } : c
    ))

    try {
      // Get all previously executed cells up to this one
      const cellIndex = jupyterCells.findIndex(c => c.id === id)
      const previousCells = jupyterCells.slice(0, cellIndex).filter(c => c.hasExecuted)

      let accumulatedCode = ''
      let files = {}

      // Create appropriate file based on selected language
      const fileName = getFileNameForLanguage(selectedLanguage)
      
      if (selectedLanguage === 'scala') {
        // For Scala, we can accumulate but it's more complex due to object-oriented nature
        // For now, just run the current cell
        files[fileName] = cell.code
      } else {
        // For most languages, accumulate code from previous cells
        accumulatedCode = previousCells.map(c => c.code).join('\n') + '\n' + cell.code
        files[fileName] = accumulatedCode
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: selectedProblem?.ID || 'jupyter-cell',
          language: selectedLanguage,
          files: files
        })
      })

      const result = await response.json()

      let output = ''
      if (result.result) {
        output = result.result
      } else if (result.verdict === 'Accepted') {
        output = 'Cell executed successfully'
      } else if (result.error) {
        output = `Error: ${result.error}`
      } else if (result.tests && result.tests.length > 0) {
        const errorMsg = result.tests[0]?.message || 'Execution failed'
        output = `${errorMsg}`
      } else {
        output = 'Cell executed'
      }

      setJupyterCells(jupyterCells.map(c =>
        c.id === id ? { ...c, isRunning: false, output: output, hasExecuted: true } : c
      ))
    } catch (err) {
      setJupyterCells(jupyterCells.map(c =>
        c.id === id ? { ...c, isRunning: false, output: `Error: ${err.message}` } : c
      ))
    }
  }

  const deleteJupyterCell = (id) => {
    if (jupyterCells.length > 1) {
      setJupyterCells(jupyterCells.filter(cell => cell.id !== id))
    }
  }

  const clearJupyterCell = (id) => {
    setJupyterCells(jupyterCells.map(cell =>
      cell.id === id ? { ...cell, code: '', output: '', hasExecuted: false } : cell
    ))
  }

  const clearJupyterCellOutput = (id) => {
    setJupyterCells(jupyterCells.map(cell =>
      cell.id === id ? { ...cell, output: '' } : cell
    ))
  }

  // Handle initial URL hash for deep linking
  useEffect(() => {
    const handleInitialUrl = () => {
      const hash = window.location.hash

      if (hash.startsWith('#problem=')) {
        const hashParams = hash.substring(1) // Remove the #
        const params = new URLSearchParams(hashParams)
        const problemId = decodeURIComponent(params.get('problem') || '')
        const view = params.get('view')

        // Wait for problems to load, then navigate
        const checkProblems = () => {
          if (problems.length > 0) {
            const problem = problems.find(p => (p.ID || p.id) === problemId)
            if (problem) {
              setSelectedProblem(problem)
              setResult(null)
              setError(null)
              setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
            }
          } else {
            setTimeout(checkProblems, 100)
          }
        }
        checkProblems()
      } else {
        // Initialize home state if no hash
        if (!window.history.state) {
          window.history.replaceState({ page: 'home' }, '', '/')
        }
        // Ensure we're on home page
        setSelectedProblem(null)
        setResult(null)
        setError(null)
        setJupyterCells([{ id: 1, code: '', output: '', isRunning: false }])
      }
    }

    handleInitialUrl()
  }, [problems])

  useEffect(() => {
    const fetchProblems = async (retryCount = 0) => {
      try {
        const response = await fetch('/api/problems')
        if (!response.ok) throw new Error('Failed to fetch problems')
        const data = await response.json()
        setProblems(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching problems:', err)
        setIsBackendConnected(false)
        if (retryCount < 3) {
          setTimeout(() => fetchProblems(retryCount + 1), 1000 * (retryCount + 1))
        } else {
          setError('Failed to load problems. Please check if the backend is running.')
        }
      } finally {
        setIsLoadingProblems(false)
      }
    }
    fetchProblems()
  }, [])

  // Global keyboard shortcuts (only when not in input fields)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        return
      }

      // Global shortcuts (work anywhere)
      
      // F5 to run code
      if (e.key === 'F5') {
        e.preventDefault()
        if (selectedProblem && code.trim() && !isRunning) {
          runCode()
        }
        return
      }
      
      // Ctrl/Cmd + Shift + Enter to submit code
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        if (selectedProblem && code.trim() && !isSubmittingCode) {
          submitCode()
        }
        return
      }
      
      // Escape to go back to problems list
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false)
        } else if (selectedProblem) {
          setSelectedProblem(null)
        }
        return
      }
      
      // Ctrl/Cmd + Shift + L to cycle language forward
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        cycleLanguage(1)
        return
      }
      
      // Ctrl/Cmd + Shift + J to cycle language backward
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        cycleLanguage(-1)
        return
      }
      
      // Ctrl/Cmd + Shift + D to toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        toggleDarkMode()
        return
      }
      
      // Ctrl/Cmd + Shift + ? to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
        e.preventDefault()
        showKeyboardShortcuts()
        return
      }
      
      // Ctrl/Cmd + 1-9 to switch to specific language (if available)
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const languageIndex = parseInt(e.key) - 1
        if (languageIndex < allSupportedLanguages.length) {
          const newLanguage = allSupportedLanguages[languageIndex]
          setSelectedLanguage(newLanguage)
          if (selectedProblem && selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
            setCode(selectedProblem.Stub[newLanguage])
          } else {
            setCode(getDefaultStubForLanguage(newLanguage))
          }
        }
        return
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [selectedProblem, code, isRunning, isSubmittingCode, selectedLanguage, showShortcuts, isDarkMode])

  useEffect(() => {
    if (!selectedProblem) return

    const fetchProblemDetails = async () => {
      setIsLoadingProblem(true)
      setError(null)
      try {
        const response = await fetch(`/api/problem/${encodeURIComponent(selectedProblem.ID)}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Problem not found')
          }
          throw new Error('Failed to fetch problem details')
        }
        const problem = await response.json()
        if (!problem || !problem.ID) {
          throw new Error('Invalid problem data')
        }

        // Update language and code based on problem
        const firstLanguage = problem.Languages && problem.Languages[0] ? problem.Languages[0] : 'python'
        setSelectedLanguage(firstLanguage)

        // Load stub code for the selected language
        let stubCode = ''
        if (problem.Stub && problem.Stub[firstLanguage]) {
          // Use problem-specific stub if available
          stubCode = problem.Stub[firstLanguage]
        } else {
          // Use default stub for the language
          stubCode = getDefaultStubForLanguage(firstLanguage)
        }
        setCode(stubCode)

        // Fetch uploaded files for this problem
        fetchUploadedFiles(selectedProblem.ID)

        setError(null)
      } catch (err) {
        console.error('Error fetching problem details:', err)
        setError(`Failed to load problem details: ${err.message}`)
      } finally {
        setIsLoadingProblem(false)
      }
    }
    fetchProblemDetails()
  }, [selectedProblem])

  const submitCode = async () => {
    if (!selectedProblem) return
    
    setIsSubmittingCode(true)
    setResult(null)
    setError(null)

    try {
      let files = {}
      if (isJupyterMode) {
        // For Jupyter mode, combine all executed cells
        const executedCells = jupyterCells.filter(c => c.hasExecuted && c.code.trim())
        const combinedCode = executedCells.map(c => c.code).join('\n')
        const fileName = getFileNameForLanguage(selectedLanguage)
        files[fileName] = combinedCode
      } else {
        // For IDE mode, use the current code
        const fileName = getFileNameForLanguage(selectedLanguage)
        files[fileName] = code
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ProblemID: selectedProblem.ID,
          Language: selectedLanguage,
          Files: files
        })
      })

      const result = await response.json()
      setResult(result)

      if (result.verdict === 'Accepted') {
        alert('Code submitted successfully!')
      } else {
        alert('Submission completed. Check the results for details.')
      }
    } catch (err) {
      console.error('Submit failed:', err)
      setError('Submission failed: ' + err.message)
    } finally {
      setIsSubmittingCode(false)
    }
  }

  const runCode = async () => {
    if (!selectedProblem) return

    setIsRunning(true)
    setResult(null)
    setError(null)

    try {
      const files = {}
      const fileName = getFileNameForLanguage(selectedLanguage)
      files[fileName] = code

      console.log('Running code:', {
        language: selectedLanguage,
        files: files
      })

      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          files: files,
          input: '' // Empty input for now - can be extended later
        })
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        // For HTTP errors, try to get error message from response
        let errorMsg = 'Code execution failed'
        
        // Clone the response so we can read it multiple times if needed
        const responseClone = response.clone()
        const responseText = await responseClone.text()
        console.error('HTTP Error Response:', response.status, responseText)
        
        try {
          const errorData = JSON.parse(responseText)
          console.error('Parsed error data:', errorData)
          if (errorData.error) {
            errorMsg = errorData.error
          } else if (errorData.message) {
            errorMsg = errorData.message
          } else {
            errorMsg = responseText || `HTTP ${response.status} error`
          }
        } catch {
          // If response is not JSON, use the raw text or status
          errorMsg = responseText || `HTTP ${response.status}: ${response.statusText}`
        }
        // Show error in result, not in error state
        setResult({
          result: '',
          error: errorMsg,
          compile_log: ''
        })
        setError(null)
        return
      }

      const data = await response.json()
      console.log('Response data:', data)
      console.log('result.result:', data.result)
      console.log('result.error:', data.error)
      console.log('result type:', typeof data.result)
      console.log('result length:', data.result ? data.result.length : 0)

      // Validate response structure
      if (!data || typeof data !== 'object') {
        setResult({
          result: '',
          error: 'Invalid response from server',
          compile_log: ''
        })
        setError(null)
        return
      }

      // The /api/run endpoint returns {result: stdout, error: stderr}
      // Always set result - even if empty, so we can see what's happening
      const resultData = {
        result: data.result || '',
        error: data.error || '',
        compile_log: '' // No compile log from /api/run
      }
      
      console.log('Setting result:', resultData)
      setResult(resultData)
      // Clear any previous HTTP errors from the console
      setError(null)
    } catch (err) {
      console.error('Error running code:', err)
      // Don't set error state - only show code execution errors in result
      // For network errors, show a simple message
      const errorMsg = err.message.includes('fetch') || err.message.includes('network') 
        ? 'Network error. Please check your connection and try again.'
        : 'Code execution failed. Please check your code and try again.'
      setResult({
        result: '',
        error: errorMsg,
        compile_log: ''
      })
      setError(null) // Clear error state so it doesn't show in console
    } finally {
      setIsRunning(false)
    }
  }

  const retryFetchProblems = () => {
    setIsLoadingProblems(true)
    setError(null)
    setRetryCount(0)
    const fetchProblems = async (retryCount = 0) => {
      try {
        const response = await fetch('/api/problems')
        if (!response.ok) throw new Error('Failed to fetch problems')
        const data = await response.json()
        setProblems(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching problems:', err)
        if (retryCount < 3) {
          setTimeout(() => fetchProblems(retryCount + 1), 1000 * (retryCount + 1))
        } else {
          setError('Failed to load problems. Please check if the backend is running.')
        }
      } finally {
        setIsLoadingProblems(false)
      }
    }
    fetchProblems()
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.background,
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <header style={{
        height: '56px',
        backgroundColor: theme.background,
        borderBottom: `1px solid ${theme.border}`,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h1 style={{
            margin: 0,
            color: theme.text,
            fontSize: '20px',
            fontWeight: '600',
            letterSpacing: '-0.5px'
          }}>
            CeesarCode
          </h1>
          <button
            onClick={() => setShowCreateProblem(true)}
            style={{
              backgroundColor: theme.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.accent}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
          >
            <span style={{ marginRight: '6px' }}>+</span>Create Problem
          </button>
          <button
            onClick={() => setShowAgent(true)}
            style={{
              backgroundColor: theme.accent,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            AI Agent
          </button>
  </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: theme.textSecondary }}>
            <span style={{ 
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isBackendConnected ? theme.success : theme.error,
              marginRight: '6px'
            }} />
            {isBackendConnected ? 'Connected' : 'Disconnected'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => window.history.back()}
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                padding: '6px 10px',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Go back"
            >
              ← Back
            </button>
            <button
              onClick={() => window.history.forward()}
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                padding: '6px 10px',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Go forward"
            >
              Forward →
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '4px',
                padding: '6px 10px',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Refresh page"
            >
              <span style={{ marginRight: '4px' }}>↻</span>Refresh
            </button>
          </div>
          <button
            onClick={toggleDarkMode}
            style={{
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              padding: '8px 12px',
              color: theme.text,
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      {showCreateProblem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                margin: 0,
                color: theme.text,
                fontSize: '24px',
                fontWeight: '600',
                letterSpacing: '-0.5px',
                marginBottom: '24px'
              }}>
                Create New Problem
              </h2>
              <button
                onClick={() => setShowCreateProblem(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Problem Title
                </label>
                <input
                  type="text"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                  placeholder="Enter problem title"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Problem Statement
                </label>
                <textarea
                  value={newProblem.statement}
                  onChange={(e) => setNewProblem({...newProblem, statement: e.target.value})}
                  style={{
                    width: '100%',
                    height: '150px',
                    padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px',
                    resize: 'vertical',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit',
                    lineHeight: '1.6'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                  placeholder="Describe the problem"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Supported Languages
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {allSupportedLanguages.map(lang => (
                    <label key={lang} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: newProblem.languages.includes(lang) ? theme.primary : theme.secondary,
                      color: newProblem.languages.includes(lang) ? '#FFFFFF' : theme.text,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      border: `1px solid ${theme.border}`
                    }}>
                      <input
                        type="checkbox"
                        checked={newProblem.languages.includes(lang)}
                        onChange={(e) => {
                          const selected = Array.from(
                            document.querySelectorAll('input[name="languages"]:checked'),
                            input => input.value
                          )
                          setNewProblem({...newProblem, languages: selected})
                        }}
                        name="languages"
                        value={lang}
                        style={{ display: 'none' }}
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  onClick={() => setShowCreateProblem(false)}
                  style={{
                    flex: 1,
                    backgroundColor: theme.secondary,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newProblem.title.trim() || !newProblem.statement.trim()) {
                      alert('Please fill in title and statement')
                      return
                    }

                    try {
                      const response = await fetch('/api/problems/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newProblem)
                      })

                      if (!response.ok) throw new Error('Failed to create problem')

                      const result = await response.json()
                      console.log('Problem created:', result)

                      // Refresh problems list
                      const fetchProblems = async () => {
                        try {
                          const response = await fetch('/api/problems')
                          if (!response.ok) throw new Error('Failed to fetch problems')
                          const data = await response.json()
                          setProblems(data)
                        } catch (err) {
                          console.error('Error fetching problems:', err)
                        }
                      }
                      fetchProblems()

                      // Reset form
                      setShowCreateProblem(false)
                      setNewProblem({
                        title: '',
                        statement: '',
                        languages: ['python'],
                        stub: { python: '' }
                      })
                    } catch (err) {
                      console.error('Error creating problem:', err)
                      alert('Failed to create problem: ' + err.message)
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: theme.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Create Problem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAgent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '32px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                margin: 0,
                color: theme.text,
                fontSize: '24px',
                fontWeight: '600',
                letterSpacing: '-0.5px'
              }}>
                AI Question Generator
              </h2>
              <button
                onClick={() => setShowAgent(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: theme.textSecondary
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{
                margin: '0 0 16px 0',
                color: theme.textSecondary,
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Generate custom coding interview questions tailored to specific companies, roles, and experience levels.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={agentRequest.company}
                  onChange={(e) => setAgentRequest({...agentRequest, company: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                  placeholder="e.g., Google, Microsoft, Amazon"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{
                    margin: 0,
                  color: theme.text,
                  fontSize: '14px',
                    fontWeight: '600'
                }}>
                  Role *
                </label>
                  <button
                    onClick={() => {
                      setUseCustomRole(!useCustomRole)
                      setAgentRequest({...agentRequest, role: '', customRole: ''})
                    }}
                    style={{
                      backgroundColor: useCustomRole ? theme.primary : theme.surface,
                      color: useCustomRole ? '#FFFFFF' : theme.text,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {useCustomRole ? 'Use Preset Roles' : 'Custom Role'}
                  </button>
                </div>
                {useCustomRole ? (
                  <input
                    type="text"
                    value={agentRequest.customRole}
                    onChange={(e) => setAgentRequest({...agentRequest, customRole: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      backgroundColor: theme.background,
                      color: theme.text,
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border}
                    placeholder="e.g., Blockchain Engineer, AI Researcher"
                  />
                ) : (
                <select
                  value={agentRequest.role}
                  onChange={(e) => setAgentRequest({...agentRequest, role: e.target.value})}
                  style={{
                    width: '100%',
                      padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                      fontSize: '14px',
                      transition: 'border-color 0.2s ease',
                      cursor: 'pointer'
                  }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border}
                >
                  <option value="">Select a role</option>
                  {commonRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Experience Level
                </label>
                <select
                  value={agentRequest.level}
                  onChange={(e) => setAgentRequest({...agentRequest, level: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                >
                  {jobLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={agentRequest.count}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '') {
                      setAgentRequest({...agentRequest, count: ''});
                    } else {
                      const value = parseInt(inputValue);
                      if (!isNaN(value)) {
                        setAgentRequest({...agentRequest, count: Math.max(1, Math.min(10, value))});
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.border
                    if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                      setAgentRequest({...agentRequest, count: 3});
                    }
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Job Description (Optional)
                </label>
                <textarea
                  value={agentRequest.jobDescription}
                  onChange={(e) => setAgentRequest({...agentRequest, jobDescription: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease',
                    minHeight: '100px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                  placeholder="Paste the job description here to generate more relevant questions..."
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Company Description (Optional)
                </label>
                <textarea
                  value={agentRequest.companyDescription}
                  onChange={(e) => setAgentRequest({...agentRequest, companyDescription: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease',
                    minHeight: '100px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                  placeholder="Add company information for better context (e.g., tech stack, company culture, etc.)..."
                />
              </div>
            </div>

            {agentResult && (
              <div style={{
                marginTop: '20px',
                padding: '12px',
                backgroundColor: agentResult.status === 'success' ? `${theme.success}15` : `${theme.error}15`,
                border: `1px solid ${agentResult.status === 'success' ? theme.success : theme.error}`,
                borderRadius: '6px'
              }}>
                <p style={{
                  margin: 0,
                  color: agentResult.status === 'success' ? theme.success : theme.error,
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {agentResult.message}
                </p>
                {agentResult.status === 'success' && agentResult.problems && (
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ margin: '0 0 8px 0', color: theme.text, fontSize: '12px' }}>
                      Generated problems:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: theme.textSecondary, fontSize: '12px' }}>
                      {agentResult.problems.map((problem, index) => (
                        <li key={index}>{problem.Title || problem.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowAgent(false)}
                style={{
                  flex: 1,
                  backgroundColor: theme.secondary,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAgentRequest({
                    company: '',
                    role: '',
                    level: 'mid',
                    count: 3
                  });
                  setAgentResult(null);
                }}
                style={{
                  backgroundColor: theme.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <span style={{ marginRight: '4px' }}>↻</span>Reset
              </button>
              <button
                onClick={generateQuestions}
                disabled={isGeneratingQuestions || !agentRequest.company || !agentRequest.role}
                style={{
                  flex: 1,
                  backgroundColor: isGeneratingQuestions || !agentRequest.company || !agentRequest.role ? theme.border : theme.accent,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '14px',
                  cursor: isGeneratingQuestions || !agentRequest.company || !agentRequest.role ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  opacity: isGeneratingQuestions || !agentRequest.company || !agentRequest.role ? 0.6 : 1
                }}
              >
                {isGeneratingQuestions ? 'Generating...' : <><span style={{ marginRight: '6px' }}>⚡</span>Generate Questions</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 56px)',
        overflow: 'visible',
        position: 'relative'
      }}>
        {!sidebarCollapsed && (
          <>
        <aside style={{
              width: `${sidebarWidth}px`,
              backgroundColor: theme.background,
          borderRight: `1px solid ${theme.border}`,
          padding: '20px',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
              transition: 'width 0.2s ease',
              position: 'relative',
              minWidth: '200px',
              maxWidth: '600px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{
                margin: 0,
                color: theme.text,
                fontSize: '18px',
                    fontWeight: '700',
                    letterSpacing: '-0.4px'
              }}>
                Problems
              </h2>
                  <button
                    onClick={toggleSidebar}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: theme.textSecondary,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.surface
                      e.target.style.color = theme.text
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = theme.textSecondary
                    }}
                    title="Collapse sidebar"
                  >
                    ◀
                  </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={async () => {
                    setIsLoadingProblems(true)
                    try {
                      // First clean AI problems, then refresh
                      const cleanResponse = await fetch('/api/agent/clean', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      })
                      
                      if (cleanResponse.ok) {
                        const cleanResult = await cleanResponse.json()
                        if (cleanResult.count > 0) {
                          console.log(`Cleaned ${cleanResult.count} AI-generated problems`)
                        }
                      }
                      
                      // Then refresh the problems list
                      const response = await fetch('/api/problems')
                      if (!response.ok) throw new Error('Failed to fetch problems')
                      const data = await response.json()
                      setProblems(data || [])
                    } catch (err) {
                      console.error('Error refreshing problems:', err)
                      alert('Failed to refresh problems: ' + err.message)
                    } finally {
                      setIsLoadingProblems(false)
                    }
                  }}
                  style={{
                    backgroundColor: theme.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  <span style={{ marginRight: '4px' }}>↻</span>Refresh
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('This will remove all AI-generated problems. Are you sure?')) {
                      return
                    }
                    
                    setIsLoadingProblems(true)
                    try {
                      const response = await fetch('/api/agent/clean', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      })
                      if (!response.ok) throw new Error('Failed to clean AI problems')
                      
                      const result = await response.json()
                      alert(result.message)
                      
                      // Refresh the problems list
                      const refreshResponse = await fetch('/api/problems')
                      if (refreshResponse.ok) {
                        const data = await refreshResponse.json()
                        setProblems(data || [])
                      }
                    } catch (err) {
                      console.error('Error cleaning AI problems:', err)
                      alert('Failed to clean AI problems: ' + err.message)
                    } finally {
                      setIsLoadingProblems(false)
                    }
                  }}
                  style={{
                    backgroundColor: theme.error,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  <span style={{ marginRight: '4px' }}>🗑</span>Clean AI
                </button>
              </div>
            </div>
            {isLoadingProblems ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <LoadingSpinner theme={theme} />
                <p style={{ margin: '12px 0 0 0', color: theme.textSecondary }}>
                  Loading problems...
                </p>
              </div>
            ) : (
              <div>
                {problems.map(problem => {
                  // Handle both uppercase and lowercase field names
                  const problemID = problem.ID || problem.id
                  const problemTitle = problem.Title || problem.title
                  const problemLanguages = problem.Languages || problem.languages || []
                  
                  return (
                    <div
                      key={problemID}
                      style={{
                        marginBottom: '10px',
                        padding: '16px',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        backgroundColor: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                          ? theme.primary
                          : theme.background,
                        color: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                          ? '#FFFFFF'
                          : theme.text,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                          ? '0 4px 12px rgba(0,0,0,0.15)'
                          : '0 1px 2px rgba(0,0,0,0.05)',
                        borderLeft: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                          ? `4px solid ${theme.accent}`
                          : `4px solid transparent`
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedProblem || (selectedProblem.ID || selectedProblem.id) !== problemID) {
                          e.currentTarget.style.backgroundColor = theme.surface
                          e.currentTarget.style.transform = 'translateX(2px)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedProblem || (selectedProblem.ID || selectedProblem.id) !== problemID) {
                          e.currentTarget.style.backgroundColor = theme.background
                          e.currentTarget.style.transform = 'translateX(0)'
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                        }
                      }}
                      onClick={() => {
                        setSelectedProblem(problem)
                        setResult(null)
                        setError(null)
                        setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
                        window.history.pushState({ problemId: problemID }, '', `#problem=${encodeURIComponent(problemID)}`)
                      }}
                    >
                      <div style={{ 
                        fontWeight: '600',
                        fontSize: '15px',
                        marginBottom: '6px',
                        lineHeight: '1.4'
                      }}>
                        {problemTitle}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        opacity: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID ? 0.9 : 0.6,
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          backgroundColor: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                            ? 'rgba(255,255,255,0.2)'
                            : theme.surface,
                          borderRadius: '12px',
                          fontSize: '11px'
                        }}>
                          {problemLanguages.length || 0} {problemLanguages.length === 1 ? 'language' : 'languages'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </aside>
            <div
              onMouseDown={(e) => {
                e.preventDefault()
                setIsResizing(true)
              }}
              style={{
                width: '4px',
                backgroundColor: theme.border,
                cursor: 'col-resize',
                position: 'relative',
                flexShrink: 0,
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = theme.primary}
              onMouseLeave={(e) => {
                if (!isResizing) {
                  e.target.style.backgroundColor = theme.border
                }
              }}
            />
          </>
        )}
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              left: 0,
              top: 'calc(56px + 20px)',
              backgroundColor: theme.primary,
              color: '#FFFFFF',
              border: 'none',
              borderTopRightRadius: '6px',
              borderBottomRightRadius: '6px',
              padding: '12px 6px',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            ▶
          </button>
        )}

        <main style={{
          padding: sidebarCollapsed ? '32px' : '24px',
          overflowY: 'auto',
          backgroundColor: theme.background,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          transition: 'padding 0.2s ease'
        }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: theme.surface,
              border: `1px solid ${theme.error}`,
              borderRadius: '8px',
              marginBottom: '20px',
              color: theme.error
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {isLoadingProblem ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <LoadingSpinner theme={theme} />
              <p style={{ margin: '12px 0 0 0', color: theme.textSecondary }}>Loading problem...</p>
            </div>
          ) : selectedProblem ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 56px)',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                backgroundColor: theme.background,
                borderBottom: `1px solid ${theme.border}`,
                flexShrink: 0
              }}>
                <h2 style={{
                  margin: '0',
                  color: theme.text,
                  fontSize: '20px',
                  fontWeight: '600',
                  letterSpacing: '-0.3px',
                  lineHeight: '1.3'
                }}>
                  {selectedProblem.Title}
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setIsJupyterMode(!isJupyterMode)}
                    style={{
                      backgroundColor: isJupyterMode ? theme.primary : theme.surface,
                      color: isJupyterMode ? '#FFFFFF' : theme.text,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {isJupyterMode ? <><span style={{ marginRight: '4px' }}>💻</span>IDE Mode</> : <><span style={{ marginRight: '4px' }}>📓</span>Jupyter Mode</>}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProblem(null)
                      setResult(null)
                      setError(null)
                      setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
                      window.history.pushState({ page: 'home' }, '', '/')
                    }}
                    style={{
                      backgroundColor: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ← Back
                  </button>
                </div>
              </div>

              {/* Main Content: Side-by-Side Layout */}
              <div data-panes-container style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
                {/* Left Panel: Problem Statement */}
              <div style={{
                  width: `${leftPaneWidth}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRight: `1px solid ${theme.border}`,
                  backgroundColor: theme.background,
                  overflow: 'hidden',
                  minWidth: '200px',
                  maxWidth: '75%'
              }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${theme.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                    flexShrink: 0
                }}>
                  <h4 style={{
                    margin: 0,
                    color: theme.text,
                      fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Problem Statement
                  </h4>
                </div>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: theme.text
                  }}>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                      lineHeight: '1.6',
                  color: theme.text,
                  margin: 0
                }}>
                  {selectedProblem.Statement}
                </pre>
                  </div>
              </div>

                {/* Resize Handle Between Panes */}
                <div
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setIsResizingPanes(true)
                  }}
                  style={{
                    width: '4px',
                    backgroundColor: theme.border,
                    cursor: 'col-resize',
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.primary}
                  onMouseLeave={(e) => {
                    if (!isResizingPanes) {
                      e.target.style.backgroundColor = theme.border
                    }
                  }}
                />

                {/* Right Panel: Code Editor */}
                {!isJupyterMode ? (
                <div style={{
                    width: `${100 - leftPaneWidth}%`,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.background,
                    overflow: 'hidden',
                    minWidth: '300px'
                }}>
                  <div style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${theme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                      flexShrink: 0
                  }}>
                    <h4 style={{
                      margin: 0,
                      color: theme.text,
                        fontSize: '14px',
                      fontWeight: '600'
                    }}>
                        Code Editor
                    </h4>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => {
                            const newLanguage = e.target.value
                            setSelectedLanguage(newLanguage)
                            let newCode = ''
                            if (selectedProblem && selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
                              newCode = selectedProblem.Stub[newLanguage]
                            } else {
                              newCode = getDefaultStubForLanguage(newLanguage)
                            }
                            setCode(newCode)
                          }}
                            style={{
                              padding: '4px 8px',
                            border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                            backgroundColor: theme.background,
                            color: theme.text,
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            minWidth: '100px',
                            fontFamily: 'inherit'
                          }}
                        >
                          <option value="python">Python</option>
                          <option value="cpp">C++</option>
                          <option value="c">C</option>
                          <option value="java">Java</option>
                          <option value="javascript">JavaScript</option>
                          <option value="typescript">TypeScript</option>
                          <option value="swift">Swift</option>
                          <option value="kotlin">Kotlin</option>
                          <option value="scala">Scala</option>
                          <option value="go">Go</option>
                          <option value="ruby">Ruby</option>
                          <option value="rust">Rust</option>
                          <option value="sql">SQL</option>
                          <option value="bash">Bash</option>
                        </select>
                          <button
                          onClick={runCode}
                          disabled={isRunning || isSubmittingCode}
                            style={{
                            backgroundColor: (isRunning || isSubmittingCode) ? theme.secondary : theme.primary,
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                            padding: '4px 10px',
                              fontSize: '11px',
                            cursor: (isRunning || isSubmittingCode) ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isRunning ? 'Running...' : <><span>▶</span>Run</>}
                          </button>
                          <button
                          onClick={submitCode}
                          disabled={isRunning || isSubmittingCode}
                            style={{
                            backgroundColor: (isRunning || isSubmittingCode) ? theme.secondary : theme.success,
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                            padding: '4px 10px',
                              fontSize: '11px',
                            cursor: (isRunning || isSubmittingCode) ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isSubmittingCode ? 'Submitting...' : <><span>✓</span>Submit</>}
                      </button>
                    </div>
                  </div>
                    <div data-editor-container style={{ 
                      position: 'relative', 
                      flex: 1, 
                      minHeight: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: theme.codeBackground
                    }}>
                      {/* Code Editor with Embedded Line Numbers - Single Scroll Container */}
                      <div style={{
                        position: 'relative',
                        flex: 1,
                        minHeight: 0,
                              overflow: 'auto',
                        backgroundColor: theme.codeBackground
                      }}>
                        {/* Content wrapper that contains both line numbers and textarea */}
                        <div style={{
                          display: 'flex',
                          minHeight: '100%',
                          position: 'relative',
                          width: '100%',
                          alignItems: 'flex-start'
                        }}>
                          {/* Line Numbers - part of scrollable content */}
                          <div 
                            id="line-numbers-container"
                            style={{
                              width: '50px',
                              flexShrink: 0,
                              padding: '16px 8px 16px 16px',
                              backgroundColor: isDarkMode ? '#1E1E1E' : '#F8F8F8',
                              borderRight: `1px solid ${theme.border}`,
                              color: isDarkMode ? '#858585' : '#999',
                              fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
                              fontSize: '14px',
                              lineHeight: '1.6',
                              textAlign: 'right',
                              userSelect: 'none',
                              minHeight: '100%',
                              height: 'auto'
                            }}>
                            {code.split('\n').map((_, index) => (
                              <div key={index} style={{
                                height: '1.6em',
                                paddingRight: '8px'
                              }}>
                                {index + 1}
                          </div>
                            ))}
                          </div>
                          {/* Code Textarea - part of scrollable content */}
                            <textarea
                            ref={codeTextareaRef}
                            value={code}
                            onChange={(e) => {
                              setCode(e.target.value)
                              // Height will be updated by useEffect
                            }}
                            onKeyDown={(e) => {
                              handleKeyDown(e)
                              // Height will be updated by useEffect after state change
                            }}
                            onInput={(e) => {
                              // Update height immediately on input for better responsiveness
                              const textarea = e.target
                              const scrollContainer = textarea.parentElement.parentElement
                              const lineNumbersDiv = textarea.previousElementSibling
                              
                              if (scrollContainer && lineNumbersDiv) {
                                // Reset heights
                                textarea.style.height = 'auto'
                                lineNumbersDiv.style.height = 'auto'
                                
                                // Force reflow for accurate scrollHeight
                                void textarea.offsetHeight
                                
                                // Calculate heights
                                const contentHeight = textarea.scrollHeight
                                const containerHeight = scrollContainer.clientHeight
                                const finalHeight = Math.max(contentHeight, containerHeight)
                                
                                // Apply heights
                                textarea.style.height = finalHeight + 'px'
                                lineNumbersDiv.style.height = finalHeight + 'px'
                              }
                            }}
                            style={{
                              flex: 1,
                              width: '100%',
                              minHeight: '100%',
                              padding: '16px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: theme.text,
                              fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Liberation Mono", "Courier New", monospace',
                              fontSize: '14px',
                              lineHeight: '1.6',
                              resize: 'none',
                              outline: 'none',
                              tabSize: 2,
                              overflow: 'hidden',
                              boxSizing: 'border-box',
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              height: 'auto'
                            }}
                            placeholder="Write your code here..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Console Output Section */}
                    {consoleCollapsed ? (
                    <div style={{
                        height: '40px',
                        borderTop: `2px solid ${theme.primary}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px',
                        backgroundColor: isDarkMode ? '#252526' : '#161B22',
                            cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        zIndex: 5,
                        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
                      }}
                      onClick={toggleConsole}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#2D2D30' : '#1F2329'
                        e.currentTarget.style.borderTopColor = theme.accent
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#252526' : '#161B22'
                        e.currentTarget.style.borderTopColor = theme.primary
                      }}
                      title="Click to expand console output"
                      >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                          gap: '10px'
                        }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: isDarkMode ? '#CCCCCC' : '#C9D1D9',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Output
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: isDarkMode ? '#999' : '#888',
                            fontStyle: 'italic',
                            fontWeight: 'normal'
                          }}>
                            (Collapsed - Click to expand)
                          </span>
                        </div>
                          <span style={{
                            fontSize: '16px',
                          color: theme.primary,
                          fontWeight: 'bold',
                          transition: 'transform 0.2s ease'
                          }}>
                          ▼
                          </span>
                      </div>
                    ) : (
                      <div data-console-container style={{
                        height: `${consoleHeight}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: isDarkMode ? '#1E1E1E' : '#0D1117',
                        borderTop: `1px solid ${theme.border}`,
                              overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        {/* Resize Handle at Top */}
                        <div
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setIsResizingConsole(true)
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            cursor: 'row-resize',
                            backgroundColor: 'transparent',
                            zIndex: 10
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme.primary
                            e.target.style.opacity = '0.3'
                          }}
                          onMouseLeave={(e) => {
                            if (!isResizingConsole) {
                              e.target.style.backgroundColor = 'transparent'
                              e.target.style.opacity = '1'
                            }
                          }}
                        />
                  <div style={{
                          padding: '8px 16px',
                          borderBottom: `1px solid ${theme.border}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: isDarkMode ? '#252526' : '#161B22',
                          flexShrink: 0
                  }}>
                    <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span style={{
                      fontSize: '12px',
                              fontWeight: '600',
                              color: isDarkMode ? '#CCCCCC' : '#C9D1D9',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Output
                            </span>
                            {isRunning && (
                              <span style={{
                      fontSize: '11px',
                                color: theme.primary,
                    display: 'flex',
                    alignItems: 'center',
                                gap: '4px'
                              }}>
                                <LoadingSpinner theme={theme} />
                                Running...
                              </span>
                            )}
                          </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {result && (
                              <button
                                onClick={() => setResult(null)}
                      style={{
                                  backgroundColor: 'transparent',
                                  color: isDarkMode ? '#CCCCCC' : '#C9D1D9',
                      border: 'none',
                      fontSize: '12px',
                      cursor: 'pointer',
                                  padding: '4px 8px',
                          borderRadius: '4px',
                                  transition: 'background-color 0.2s ease'
                        }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                                Clear
                      </button>
                            )}
                      <button
                              onClick={toggleConsole}
                        style={{
                                backgroundColor: 'transparent',
                                color: isDarkMode ? '#CCCCCC' : '#C9D1D9',
                          border: 'none',
                          fontSize: '12px',
                          cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s ease'
                        }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                              title="Collapse console"
                      >
                              ▲
                      </button>
                  </div>
                </div>
                        <div style={{
                          flex: 1,
                          overflowY: 'auto',
                          padding: '12px 16px',
                          fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
                          fontSize: '13px',
                    lineHeight: '1.5',
                          color: isDarkMode ? '#D4D4D4' : '#C9D1D9'
                        }}>
                          {result ? (
                            <div>
                              {/* Show actual code execution output - ALWAYS show result.result first if it exists */}
                              {result.result && result.result.trim() !== '' ? (
                                <div style={{
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  fontFamily: 'inherit'
                                }}>
                                  {result.result}
                                </div>
                              ) : result.error && result.error.trim() !== '' ? (
                                <div style={{ color: theme.error }}>
                                  <span style={{ color: theme.error, fontWeight: '600' }}>Error: </span>
                                  {result.error}
                                </div>
                              ) : result.compile_log && result.compile_log.trim() !== '' ? (
                                <div style={{
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  fontFamily: 'inherit',
                                  color: theme.error
                                }}>
                                  {result.compile_log}
                                </div>
                              ) : (
                                <div style={{ opacity: 0.5, fontStyle: 'italic' }}>
                                  (No output)
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ opacity: 0.5, fontStyle: 'italic' }}>
                              Run your code to see output here...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
              </div>
              ) : (
                <div style={{
                    width: `${100 - leftPaneWidth}%`,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.background,
                    overflow: 'hidden',
                    minWidth: '300px'
                }}>
                  <div style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${theme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                      flexShrink: 0
                  }}>
                    <h4 style={{
                      margin: 0,
                      color: theme.text,
                        fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Jupyter Notebook
                    </h4>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => {
                          const newLanguage = e.target.value
                          setSelectedLanguage(newLanguage)
                          let newCode = ''
                          if (selectedProblem && selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
                            newCode = selectedProblem.Stub[newLanguage]
                          } else {
                            newCode = getDefaultStubForLanguage(newLanguage)
                          }
                          setCode(newCode)
                        }}
                        style={{
                            padding: '4px 8px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                            backgroundColor: theme.background,
                          color: theme.text,
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            minWidth: '100px',
                            fontFamily: 'inherit'
                        }}
                      >
                        <option value="python">Python</option>
                        <option value="scala">Scala</option>
                        <option value="javascript">JavaScript</option>
                      </select>
                      <button
                        onClick={runAllJupyterCells}
                        disabled={isRunning || jupyterCells.length === 0}
                        style={{
                          backgroundColor: isRunning ? theme.secondary : theme.primary,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '11px',
                          cursor: isRunning ? 'not-allowed' : 'pointer',
                          fontWeight: '500'
                        }}
                      >
                          {isRunning ? 'Running...' : <><span>▶</span>Run All</>}
                      </button>
                      <button
                        onClick={submitCode}
                        disabled={isRunning || isSubmittingCode || jupyterCells.length === 0}
                        style={{
                          backgroundColor: (isRunning || isSubmittingCode) ? theme.secondary : theme.success,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '11px',
                          cursor: (isRunning || isSubmittingCode) ? 'not-allowed' : 'pointer',
                          fontWeight: '500'
                        }}
                      >
                          {isSubmittingCode ? 'Submitting...' : <><span>✓</span>Submit</>}
                      </button>
                    </div>
                  </div>
                  <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '12px',
                      backgroundColor: theme.background
                  }}>
                    {jupyterCells.map((cell, index) => (
                      <div key={cell.id} style={{
                          marginBottom: index < jupyterCells.length - 1 ? '12px' : 0,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          overflow: 'hidden'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: theme.secondary,
                          borderBottom: `1px solid ${theme.border}`
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{
                              fontSize: '12px',
                              color: theme.textSecondary,
                              fontWeight: '500'
                            }}>
                              In [{index + 1}]:
                            </span>
                            <button
                              onClick={() => runJupyterCell(cell.id)}
                              disabled={cell.isRunning}
                              style={{
                                backgroundColor: cell.isRunning ? theme.secondary : theme.primary,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                cursor: cell.isRunning ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {cell.isRunning ? 'Running...' : 'Run'}
                            </button>
                            <button
                              onClick={() => clearJupyterCell(cell.id)}
                              style={{
                                backgroundColor: theme.warning || '#f39c12',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                                Clear
                            </button>
                          </div>
                          {jupyterCells.length > 1 && (
                            <button
                              onClick={() => deleteJupyterCell(cell.id)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                fontSize: '14px',
                                cursor: 'pointer',
                                color: theme.error
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div style={{ padding: '12px' }}>
                          <textarea
                            value={cell.code}
                            onChange={(e) => updateJupyterCell(cell.id, e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{
                              width: '100%',
                              height: '80px',
                              padding: '8px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              backgroundColor: theme.surface,
                              color: theme.text,
                              fontFamily: 'monospace',
                              fontSize: '13px',
                              resize: 'vertical',
                              outline: 'none'
                            }}
                            placeholder="Enter code here..."
                          />
                          {cell.output && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              backgroundColor: theme.background,
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px'
                            }}>
                              <div style={{
                                fontSize: '12px',
                                color: theme.textSecondary,
                                marginBottom: '4px',
                                fontWeight: '500'
                              }}>
                                Out [{index + 1}]:
                              </div>
                              <pre style={{
                                margin: 0,
                                fontSize: '13px',
                                color: theme.text,
                                whiteSpace: 'pre-wrap'
                              }}>
                                {cell.output}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                      <button
                        onClick={addJupyterCell}
                        style={{
                          backgroundColor: theme.primary,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          width: '100%',
                          marginTop: '12px'
                        }}
                      >
                        + Add Cell
                      </button>
                  </div>
                </div>
                          )}
                        </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: theme.textSecondary, fontSize: '16px' }}>
                Select a problem from the sidebar to get started
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.background,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: `1px solid ${theme.border}`,
              paddingBottom: '12px'
            }}>
              <h2 style={{ margin: 0, color: theme.text, fontSize: '20px' }}>
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowShortcuts(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Code Execution */}
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '16px' }}>
                  Code Execution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ShortcutItem 
                    keys={['Ctrl', 'Enter']} 
                    description="Run code" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['F5']} 
                    description="Run code" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Ctrl', 'Shift', 'Enter']} 
                    description="Submit code" 
                    theme={theme} 
                  />
                </div>
              </div>

              {/* Code Editing */}
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '16px' }}>
                  Code Editing
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ShortcutItem 
                    keys={['Ctrl', '/']} 
                    description="Comment/Uncomment" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Ctrl', 'D']} 
                    description="Duplicate line" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Ctrl', 'Shift', 'K']} 
                    description="Delete line" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Alt', '↑']} 
                    description="Move line up" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Alt', '↓']} 
                    description="Move line down" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Ctrl', 'Shift', 'F']} 
                    description="Format code" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Tab']} 
                    description="Smart indentation / Tab completion" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Shift', 'Tab']} 
                    description="Remove indentation" 
                    theme={theme} 
                  />
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '16px' }}>
                  Navigation
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ShortcutItem 
                    keys={['Esc']} 
                    description="Back to problems" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Ctrl', 'Shift', 'L']} 
                    description="Next language" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Ctrl', 'Shift', 'J']} 
                    description="Previous language" 
                    theme={theme} 
                  />
                </div>
              </div>

              {/* Utilities */}
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '16px' }}>
                  Utilities
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ShortcutItem 
                    keys={['Ctrl', 'K']} 
                    description="Clear code" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Ctrl', 'Shift', 'D']} 
                    description="Toggle dark mode" 
                    theme={theme} 
                  />
                  <ShortcutItem 
                    keys={['Ctrl', 'Shift', '?']} 
                    description="Show shortcuts" 
                    theme={theme} 
                  />
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: theme.surface,
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '12px', 
                color: theme.textSecondary,
                textAlign: 'center'
              }}>
                Tip: Press <kbd style={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}>Ctrl+Shift+?</kbd> anytime to see this help!
              </p>
            </div>
          </div>
        </div>
      )}
  </div>
  )
}

// Keyboard shortcut item component
const ShortcutItem = ({ keys, description, theme }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0'
  }}>
    <span style={{ color: theme.text, fontSize: '14px' }}>{description}</span>
    <div style={{ display: 'flex', gap: '4px' }}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: theme.text,
            fontWeight: '500'
          }}>
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span style={{ color: theme.textSecondary, fontSize: '12px' }}>+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
)

