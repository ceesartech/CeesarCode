import React, { useEffect, useState } from 'react'

const styles = {
  light: {
    primary: '#6B7280', // Grey
    secondary: '#F9FAFB', // Off-white
    accent: '#374151',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
  },
  dark: {
    primary: '#9CA3AF', // Light grey
    secondary: '#1F2937', // Dark grey
    accent: '#D1D5DB',
    background: '#111827',
    surface: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24'
  }
}

const Editor = ({ value, onChange, theme, disabled }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    style={{
      width: '100%',
      height: '300px',
      fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '14px',
      padding: '12px',
      border: `1px solid ${theme.border}`,
      borderRadius: '8px',
      backgroundColor: theme.surface,
      color: theme.text,
      resize: 'vertical',
      outline: 'none'
    }}
    placeholder="Write your code here..."
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
      case 'AC': return '✓ Accepted'
      case 'WA': return '✗ Wrong Answer'
      case 'TLE': return '⏱️ Time Limit'
      case 'RE': return '⚠️ Runtime Error'
      case 'IE': return '🔧 Internal Error'
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
        {test.message || '✓ Passed'}
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
  const [showTestCases, setShowTestCases] = useState(false)
  const [testCases, setTestCases] = useState([])
  const [editingTestCases, setEditingTestCases] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useSafeArrayState([])
  const [isJupyterMode, setIsJupyterMode] = useState(false)
  const [jupyterCells, setJupyterCells] = useState([
    { id: 1, code: '', output: '', isRunning: false, hasExecuted: false }
  ])
  const [showShortcuts, setShowShortcuts] = useState(false)

  // All supported languages
  const allSupportedLanguages = [
    'python', 'cpp', 'c', 'java', 'kotlin', 'scala', 'go', 'rust',
    'swift', 'ruby', 'javascript', 'typescript', 'bash', 'sh', 'sql'
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
    // Basic formatting for common languages
    if (['python', 'javascript', 'typescript'].includes(selectedLanguage)) {
      // Simple indentation fix
      const lines = code.split('\n')
      const formattedLines = lines.map(line => {
        // Remove trailing whitespace
        return line.replace(/\s+$/, '')
      })
      setCode(formattedLines.join('\n'))
    }
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
      sql: 2
    }
    return indentSizes[language] || 4
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
    
    return null
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

  const fetchTestCases = async (problemId) => {
    try {
      const response = await fetch(`/api/problem/${problemId}/testcases`)
      if (!response.ok) throw new Error('Failed to fetch test cases')

      const testCasesData = await response.json()
      setTestCases(testCasesData)
      setShowTestCases(true) // Always show when fetching
      setEditingTestCases(false)

      // Update URL for browser navigation
      const newUrl = `${window.location.pathname}#problem=${problemId}&view=testcases`
      window.history.pushState({ problemId, view: 'testcases' }, '', newUrl)
    } catch (err) {
      console.error('Error fetching test cases:', err)
      setError('Failed to load test cases')
    }
  }

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      console.log('Pop state:', event.state)
      if (event.state) {
        const { problemId, view } = event.state
        if (problemId && view === 'testcases') {
          // Re-fetch test cases for the problem
          const problem = problems.find(p => p.ID === problemId)
          if (problem) {
            setSelectedProblem(problem)
            setResult(null)
            setError(null)
            setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
            fetchTestCases(problemId)
          }
        } else if (problemId) {
          // Just select the problem
          const problem = problems.find(p => p.ID === problemId)
          if (problem) {
            setSelectedProblem(problem)
            setResult(null)
            setError(null)
            setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
            setShowTestCases(false)
          }
        } else {
          // Go back to problem list
          setSelectedProblem(null)
          setResult(null)
          setError(null)
          setJupyterCells([{ id: 1, code: '', output: '', isRunning: false }])
          setShowTestCases(false)
        }
      } else {
        // No state means we're at the root/home page
        setSelectedProblem(null)
        setResult(null)
        setError(null)
        setJupyterCells([{ id: 1, code: '', output: '', isRunning: false }])
        setShowTestCases(false)
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

  const saveTestCases = async (problemId) => {
    try {
      const response = await fetch(`/api/problem/${problemId}/testcases`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCases)
      })

      if (!response.ok) throw new Error('Failed to save test cases')

      setEditingTestCases(false)
      alert('Test cases saved successfully!')
    } catch (err) {
      console.error('Error saving test cases:', err)
      alert('Failed to save test cases: ' + err.message)
    }
  }

  const addTestCase = () => {
    setTestCases([...testCases, { name: `Test ${testCases.length + 1}`, input: '', output: '' }])
  }

  const addMultipleTestCases = () => {
    const count = prompt('How many test cases would you like to add?', '3')
    const numCases = parseInt(count)
    
    if (numCases && numCases > 0 && numCases <= 20) {
      const newCases = Array.from({ length: numCases }, (_, i) => ({ 
        name: `Test ${testCases.length + i + 1}`, 
        input: '', 
        output: '' 
      }))
      setTestCases([...testCases, ...newCases])
    } else if (numCases > 20) {
      alert('Maximum 20 test cases can be added at once')
    }
  }

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases]
    updated[index][field] = value
    setTestCases(updated)
  }

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index))
  }

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
          output = '✓ Cell executed successfully'
        } else if (result.error) {
          output = `✗ Error: ${result.error}`
        } else if (result.tests && result.tests.length > 0) {
          const errorMsg = result.tests[0]?.message || 'Execution failed'
          output = `✗ ${errorMsg}`
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
            c.id === cell.id ? { ...c, isRunning: false, output: `✗ Error: ${error.message}` } : c
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
        output = '✓ Cell executed successfully'
      } else if (result.error) {
        output = `✗ Error: ${result.error}`
      } else if (result.tests && result.tests.length > 0) {
        const errorMsg = result.tests[0]?.message || 'Execution failed'
        output = `✗ ${errorMsg}`
      } else {
        output = 'Cell executed'
      }

      setJupyterCells(jupyterCells.map(c =>
        c.id === id ? { ...c, isRunning: false, output: output, hasExecuted: true } : c
      ))
    } catch (err) {
      setJupyterCells(jupyterCells.map(c =>
        c.id === id ? { ...c, isRunning: false, output: `✗ Error: ${err.message}` } : c
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
        const params = new URLSearchParams(hash.substring(1))
        const problemId = params.get('problem')
        const view = params.get('view')

        // Wait for problems to load, then navigate
        const checkProblems = () => {
          if (problems.length > 0) {
            const problem = problems.find(p => p.ID === problemId)
            if (problem) {
              setSelectedProblem(problem)
              setResult(null)
              setError(null)
              setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
              if (view === 'testcases') {
                fetchTestCases(problemId)
              }
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
        setShowTestCases(false)
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

  // Comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        // Only handle shortcuts that should work in textarea
        if (e.target.tagName === 'TEXTAREA') {
          // Tab for indentation and completion
          if (e.key === 'Tab') {
            handleTabKey(e)
            return
          }
          
          // Ctrl/Cmd + / for comment/uncomment
          if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault()
            toggleComment()
            return
          }
          
          // Ctrl/Cmd + D for duplicate line
          if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault()
            duplicateLine()
            return
          }
          
          // Ctrl/Cmd + Shift + K for delete line
          if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
            e.preventDefault()
            deleteLine()
            return
          }
          
          // Alt + Up/Down for move line
          if (e.altKey && e.key === 'ArrowUp') {
            e.preventDefault()
            moveLineUp()
            return
          }
          if (e.altKey && e.key === 'ArrowDown') {
            e.preventDefault()
            moveLineDown()
            return
          }
          
          // Ctrl/Cmd + Shift + F for format
          if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
            e.preventDefault()
            formatCode()
            return
          }
        }
        return
      }

      // Global shortcuts (work anywhere)
      
      // Ctrl/Cmd + Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (selectedProblem && code.trim() && !isRunning) {
          runCode()
        }
        return
      }
      
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
      
      // Ctrl/Cmd + K to clear code
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        clearCode()
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

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProblem, code, isRunning, isSubmittingCode, selectedLanguage, showShortcuts, isDarkMode])

  useEffect(() => {
    if (!selectedProblem) return

    const fetchProblemDetails = async () => {
      setIsLoadingProblem(true)
      setError(null)
      try {
        const response = await fetch(`/api/problem/${selectedProblem.ID}`)
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
        alert('🎉 All test cases passed! Code submitted successfully.')
      } else {
        alert('❌ Some test cases failed. Check the results for details.')
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

      console.log('Submitting code:', {
        problemId: selectedProblem.ID,
        language: selectedLanguage,
        files: files
      })

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: selectedProblem.ID,
          language: selectedLanguage,
          files: files
        })
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Submission failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }

      if (!data.verdict) {
        throw new Error('Missing verdict in response')
      }

      setResult(data)
    } catch (err) {
      console.error('Error running code:', err)
      setError(`Failed to run code: ${err.message}`)
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
        height: '73px',
        backgroundColor: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h1 style={{
            margin: 0,
            color: theme.text,
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            CeesarCode
          </h1>
          <button
            onClick={() => setShowCreateProblem(true)}
            style={{
              backgroundColor: theme.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            + Create Problem
          </button>
  </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: theme.textSecondary }}>
            {isBackendConnected ? '🟢 Connected' : '🔴 Disconnected'}
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
              🔄 Refresh
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
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
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
                fontSize: '20px',
                fontWeight: 'bold'
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
                  marginBottom: '4px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Problem Title
                </label>
                <input
                  type="text"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px'
                  }}
                  placeholder="Enter problem title"
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
                  Problem Statement
                </label>
                <textarea
                  value={newProblem.statement}
                  onChange={(e) => setNewProblem({...newProblem, statement: e.target.value})}
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '8px 12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
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

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Test Cases
                </label>
                {testCases.map((testCase, index) => (
                  <div key={index} style={{
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: theme.background,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        color: theme.text,
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Test Case {index + 1}
                      </span>
                      {editingTestCases && (
                        <button
                          onClick={() => removeTestCase(index)}
                          style={{
                            backgroundColor: theme.error,
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '4px',
                          color: theme.text,
                          fontSize: '12px'
                        }}>
                          Input
                        </label>
                        <textarea
                          value={testCase.input}
                          onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                          style={{
                            width: '100%',
                            height: '60px',
                            padding: '6px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '4px',
                            backgroundColor: theme.surface,
                            color: theme.text,
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            resize: 'vertical'
                          }}
                          placeholder="Test input"
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '4px',
                          color: theme.text,
                          fontSize: '12px'
                        }}>
                          Expected Output
                        </label>
                        <textarea
                          value={testCase.output}
                          onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                          style={{
                            width: '100%',
                            height: '60px',
                            padding: '6px',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '4px',
                            backgroundColor: theme.surface,
                            color: theme.text,
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            resize: 'vertical'
                          }}
                          placeholder="Expected output"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addTestCase}
                  style={{
                    backgroundColor: theme.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '12px'
                  }}
                >
                  ➕ Add Another Test Case
                </button>
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

      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 73px)',
        overflow: 'visible'
      }}>
        <aside style={{
          width: '300px',
          backgroundColor: theme.secondary,
          borderRight: `1px solid ${theme.border}`,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{
              margin: '0 0 16px 0',
              color: theme.text,
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              Problems
            </h2>
            {isLoadingProblems ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <LoadingSpinner theme={theme} />
                <p style={{ margin: '12px 0 0 0', color: theme.textSecondary }}>
                  Loading problems...
                </p>
              </div>
            ) : (
              <div>
                {problems.map(problem => (
                  <div
                    key={problem.ID}
                    style={{
                      marginBottom: '8px',
                      padding: '12px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      backgroundColor: selectedProblem && selectedProblem.ID === problem.ID
                        ? theme.primary
                        : theme.surface,
                      color: selectedProblem && selectedProblem.ID === problem.ID
                        ? '#FFFFFF'
                        : theme.text,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedProblem(problem)
                      setResult(null)
                      setError(null)
                      setShowTestCases(false)
                      setEditingTestCases(false)
                      setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
                      window.history.pushState({ problemId: problem.ID }, '', `#problem=${problem.ID}`)
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>
                      {problem.Title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.8,
                      marginTop: '4px'
                    }}>
                      {problem.Languages?.length || 0} languages supported
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main style={{
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: theme.background,
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
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
              minHeight: '100%',
              gap: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px'
              }}>
                <h2 style={{
                  margin: '0',
                  color: theme.text,
                  fontSize: '24px',
                  fontWeight: 'bold'
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
                      padding: '8px 12px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {isJupyterMode ? '💻 IDE Mode' : '📓 Jupyter Mode'}
                  </button>
                  <label style={{
                    backgroundColor: theme.secondary,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}>
                    📝 Upload Questions
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleQuestionsUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    onClick={() => {
                      setSelectedProblem(null)
                      setResult(null)
                      setError(null)
                      setShowTestCases(false)
                      setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
                      window.history.pushState({ page: 'home' }, '', '/')
                    }}
                    style={{
                      backgroundColor: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ← Back to Problems
                  </button>
                </div>
              </div>

              <div style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: `0 2px 8px ${theme.shadow || 'rgba(0,0,0,0.1)'}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <h4 style={{
                    margin: 0,
                    color: theme.text,
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    Problem Statement
                  </h4>
                  <button
                    onClick={() => {
                      if (showTestCases) {
                        setShowTestCases(false)
                      } else {
                        fetchTestCases(selectedProblem.ID)
                      }
                    }}
                    style={{
                      backgroundColor: showTestCases ? theme.primary : theme.secondary,
                      color: showTestCases ? '#FFFFFF' : theme.text,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    📋 {showTestCases ? 'Hide Test Cases' : 'View Test Cases'}
                  </button>
                </div>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: theme.text,
                  margin: 0
                }}>
                  {selectedProblem.Statement}
                </pre>
              </div>

              {showTestCases && testCases.length > 0 && (
                <div style={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      color: theme.text,
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      Test Cases
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {editingTestCases ? (
                        <>
                          <button
                            onClick={addTestCase}
                            style={{
                              backgroundColor: theme.primary,
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            ➕ Add One
                          </button>
                          <button
                            onClick={addMultipleTestCases}
                            style={{
                              backgroundColor: theme.primary,
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            📋 Add Multiple
                          </button>
                          <button
                            onClick={() => {
                              saveTestCases(selectedProblem.ID)
                              setEditingTestCases(false)
                            }}
                            style={{
                              backgroundColor: theme.success,
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={() => {
                              // Reset test cases to original state
                              fetchTestCases(selectedProblem.ID)
                              setEditingTestCases(false)
                            }}
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
                            🔄 Reset
                          </button>
                          <button
                            onClick={() => {
                              // Cancel editing without saving
                              fetchTestCases(selectedProblem.ID)
                              setEditingTestCases(false)
                            }}
                            style={{
                              backgroundColor: theme.secondary,
                              color: theme.text,
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            ❌ Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditingTestCases(true)}
                          style={{
                            backgroundColor: theme.secondary,
                            color: theme.text,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Edit
                        </button>
                      )}
                      <button
                        onClick={() => setShowTestCases(false)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          fontSize: '18px',
                          cursor: 'pointer',
                          color: theme.textSecondary,
                          padding: '0'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: theme.text
                          }}>
                            Input
                          </label>
                        </div>
                        {editingTestCases ? (
                          <textarea
                            value={testCases[0]?.input || ''}
                            onChange={(e) => updateTestCase(0, 'input', e.target.value)}
                            style={{
                              width: '100%',
                              height: '80px',
                              padding: '8px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              backgroundColor: theme.surface,
                              color: theme.text,
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              resize: 'vertical'
                            }}
                            placeholder="Enter test input"
                          />
                        ) : (
                          <pre style={{
                            padding: '8px',
                            backgroundColor: theme.secondary,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: theme.text,
                            margin: 0,
                            overflow: 'auto',
                            maxHeight: '200px'
                          }}>
                            {testCases[0]?.input || 'No input'}
                          </pre>
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: theme.text
                          }}>
                            Expected Output
                          </label>
                        </div>
                        {editingTestCases ? (
                          <textarea
                            value={testCases[0]?.output || ''}
                            onChange={(e) => updateTestCase(0, 'output', e.target.value)}
                            style={{
                              width: '100%',
                              height: '80px',
                              padding: '8px',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              backgroundColor: theme.surface,
                              color: theme.text,
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              resize: 'vertical'
                            }}
                            placeholder="Enter expected output"
                          />
                        ) : (
                          <pre style={{
                            padding: '8px',
                            backgroundColor: theme.secondary,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: theme.text,
                            margin: 0,
                            overflow: 'auto',
                            maxHeight: '200px'
                          }}>
                            {testCases[0]?.output || 'No expected output'}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                  {editingTestCases && testCases.length > 1 && (
                    <button
                      onClick={addTestCase}
                      style={{
                        backgroundColor: theme.primary,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        width: '100%',
                        marginTop: '12px'
                      }}
                    >
                      ➕ Add Another Test Case
                    </button>
                  )}
                </div>
              )}

              {/* Uploaded Files Section */}
              <ErrorBoundary>
                {safeArrayAccess(uploadedFiles, 'length') > 0 && (
                <div style={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: `0 2px 8px ${theme.shadow || 'rgba(0,0,0,0.1)'}`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      color: theme.text,
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      📎 Uploaded Files ({safeArrayAccess(uploadedFiles, 'length')})
                    </h4>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {safeArrayAccess(uploadedFiles, 'array').map((file, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        backgroundColor: theme.secondary,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flex: 1,
                          minWidth: 0
                        }}>
                          <span style={{
                            fontSize: '16px',
                            color: theme.textSecondary
                          }}>
                            📄
                          </span>
                          <div style={{
                            flex: 1,
                            minWidth: 0
                          }}>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '500',
                              color: theme.text,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {file.name}
                            </div>
                            <div style={{
                              fontSize: '10px',
                              color: theme.textSecondary,
                              marginTop: '2px'
                            }}>
                              {(file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeUploadedFile(index)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer',
                            color: theme.error,
                            padding: '4px'
                          }}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: theme.background,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: theme.textSecondary,
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      💡 Usage in Code:
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: theme.text,
                      fontFamily: 'monospace',
                      backgroundColor: theme.surface,
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${theme.border}`
                    }}>
                      pd.read_csv('{uploadedFiles[0]?.name || "filename.csv"}')<br/>
                      # Files are accessible by filename only
                    </div>
                  </div>
                </div>
                )}
              </ErrorBoundary>

              {!isJupyterMode ? (
                <div style={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: `0 2px 8px ${theme.shadow || 'rgba(0,0,0,0.1)'}`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      color: theme.text,
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      Code Editor
                    </h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        const newLanguage = e.target.value
                        setSelectedLanguage(newLanguage)
                        // Load stub code for the new language
                        let newCode = ''
                        if (selectedProblem && selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
                          // Use problem-specific stub if available
                          newCode = selectedProblem.Stub[newLanguage]
                        } else {
                          // Use default stub for the language
                          newCode = getDefaultStubForLanguage(newLanguage)
                        }
                        setCode(newCode)
                      }}
                      style={{
                        padding: '6px 8px',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '4px',
                        backgroundColor: theme.surface,
                        color: theme.text,
                        fontSize: '12px'
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
                    <label style={{
                      backgroundColor: theme.primary,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      Upload Data
                      <input
                        type="file"
                        multiple
                        accept=".csv,.json,.txt,.xlsx,.xls"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                                          <button
                        onClick={runCode}
                        disabled={isRunning || isSubmittingCode}
                        style={{
                          backgroundColor: (isRunning || isSubmittingCode) ? theme.secondary : theme.primary,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: (isRunning || isSubmittingCode) ? 'not-allowed' : 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {isRunning ? 'Running...' : 'Run Code'}
                      </button>
                      <button
                        onClick={submitCode}
                        disabled={isRunning || isSubmittingCode}
                        style={{
                          backgroundColor: (isRunning || isSubmittingCode) ? theme.secondary : theme.success,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: (isRunning || isSubmittingCode) ? 'not-allowed' : 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {isSubmittingCode ? 'Submitting...' : 'Submit Code'}
                      </button>
                      <button
                        onClick={() => setShowShortcuts(true)}
                        style={{
                          backgroundColor: theme.surface,
                          color: theme.text,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                        title="Show keyboard shortcuts (Ctrl+Shift+?)"
                      >
                        ⌨️ Shortcuts
                      </button>
                  </div>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{
                    width: '90%',
                    minHeight: '400px',
                    maxHeight: '600px',
                    padding: '16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    outline: 'none',
                    boxShadow: `0 2px 4px ${theme.shadow || 'rgba(0,0,0,0.1)'}`,
                    margin: '0 auto',
                    display: 'block'
                  }}
                  placeholder="Write your code here..."
                />
              </div>
              ) : (
                <div style={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: `0 2px 8px ${theme.shadow || 'rgba(0,0,0,0.1)'}`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      color: theme.text,
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      Jupyter Notebook
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => {
                          const newLanguage = e.target.value
                          setSelectedLanguage(newLanguage)
                          // Load stub code for the new language
                          let newCode = ''
                          if (selectedProblem && selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
                            // Use problem-specific stub if available
                            newCode = selectedProblem.Stub[newLanguage]
                          } else {
                            // Use default stub for the language
                            newCode = getDefaultStubForLanguage(newLanguage)
                          }
                          setCode(newCode)
                        }}
                        style={{
                          padding: '6px 8px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          backgroundColor: theme.surface,
                          color: theme.text,
                          fontSize: '12px'
                        }}
                      >
                        <option value="python">Python</option>
                        <option value="scala">Scala</option>
                        <option value="javascript">JavaScript</option>
                      </select>
                      <label style={{
                        backgroundColor: theme.primary,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-block',
                        fontWeight: '500'
                      }}>
                        📁 Upload Data
                        <input
                          type="file"
                          multiple
                          accept=".csv,.json,.txt,.xlsx,.xls"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <button
                        onClick={runAllJupyterCells}
                        disabled={isRunning || jupyterCells.length === 0}
                        style={{
                          backgroundColor: isRunning ? theme.secondary : theme.primary,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: isRunning ? 'not-allowed' : 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {isRunning ? 'Running...' : '🚀 Run All'}
                      </button>
                      <button
                        onClick={submitCode}
                        disabled={isRunning || isSubmittingCode || jupyterCells.length === 0}
                        style={{
                          backgroundColor: (isRunning || isSubmittingCode) ? theme.secondary : theme.success,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: (isRunning || isSubmittingCode) ? 'not-allowed' : 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {isSubmittingCode ? 'Submitting...' : '✅ Submit Code'}
                      </button>
                      <button
                        onClick={clearAllJupyterOutputs}
                        style={{
                          backgroundColor: theme.warning,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        🧹 Clear All
                      </button>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: theme.background,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    {jupyterCells.map((cell, index) => (
                      <div key={cell.id} style={{
                        borderBottom: index < jupyterCells.length - 1 ? `1px solid ${theme.border}` : 'none'
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
                              🧹 Clear
                            </button>
                            <button
                              onClick={() => clearJupyterCellOutput(cell.id)}
                              style={{
                                backgroundColor: theme.secondary,
                                color: theme.text,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Clear Output
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

                    <div style={{
                      padding: '12px',
                      backgroundColor: theme.secondary,
                      borderTop: `1px solid ${theme.border}`
                    }}>
                      <button
                        onClick={addJupyterCell}
                        style={{
                          backgroundColor: theme.primary,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        + Add Cell
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div style={{
                  marginTop: '24px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: `0 2px 8px ${theme.shadow || 'rgba(0,0,0,0.1)'}`
                }}>
                  <div style={{
                    backgroundColor: result.verdict === 'Accepted' ? theme.success : theme.error,
                    color: '#FFFFFF',
                    padding: '12px 16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div>Verdict: {result.verdict}</div>
                      {result.tests && result.tests.length > 0 && (
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 'normal',
                          opacity: 0.9,
                          marginTop: '4px'
                        }}>
                          {result.tests.filter(t => t.status === 'AC').length}/{result.tests.length} tests passed
                          {result.tests[0].time_ms && (
                            <span style={{ marginLeft: '8px' }}>
                              • {result.tests[0].time_ms}ms
                            </span>
                          )}
                        </div>
                      )}
                      {result.tests && result.tests.length > 0 && result.tests[0].message && (
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 'normal',
                          opacity: 0.8,
                          marginTop: '2px'
                        }}>
                          {result.tests[0].message}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setResult(null)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '4px',
                        opacity: 0.8
                      }}
                    >
                      ✕ Clear
                    </button>
                  </div>
                  {result.tests && result.tests.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        minWidth: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                      }}>
                        <thead style={{
                          backgroundColor: theme.secondary,
                          color: theme.text
                        }}>
                          <tr>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', minWidth: '60px' }}>Test</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', minWidth: '120px' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', minWidth: '80px' }}>Time</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', minWidth: '200px' }}>Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.tests.map((test, index) => (
                            <tr key={index} style={{ borderBottom: `1px solid ${theme.border}` }}>
                              <td style={{ padding: '12px', color: theme.text }}>{index + 1}</td>
                              <td style={{ padding: '12px', color: test.status === 'AC' ? theme.success : theme.error }}>
                                {test.status === 'AC' ? '✓ Accepted' : test.status === 'WA' ? '✗ Wrong Answer' : test.status === 'RE' ? '⚠️ Runtime Error' : test.status === 'IE' ? '❌ Internal Error' : test.status}
                              </td>
                              <td style={{ padding: '12px', color: theme.text }}>
                                {test.time_ms !== undefined ? `${test.time_ms}ms` : test.time ? `${test.time}ms` : '0ms'}
                              </td>
                              <td style={{
                                padding: '12px',
                                color: theme.text,
                                wordBreak: 'break-word',
                                maxWidth: '300px'
                              }}>
                                {test.message && test.message.trim() ? test.message : test.status === 'AC' ? 'Test passed successfully' : test.status === 'WA' ? 'Output does not match expected result' : test.status === 'RE' ? 'Code execution failed with runtime error' : test.status === 'IE' ? 'Internal error occurred during testing' : 'No additional information available'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {result.compile_log && (
                    <div style={{ padding: '16px', borderTop: `1px solid ${theme.border}` }}>
                      <h4 style={{ margin: '0 0 8px 0', color: theme.text }}>Compile Log:</h4>
                      <pre style={{
                        backgroundColor: theme.background,
                        padding: '8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: theme.textSecondary,
                        margin: 0,
                        overflow: 'auto'
                      }}>
                        {result.compile_log}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: theme.textSecondary
            }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '24px' }}>
                Welcome to CeesarCode
              </h2>
              <p style={{ margin: 0, fontSize: '16px' }}>
                Select a problem from the sidebar to get started!
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
                ⌨️ Keyboard Shortcuts
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
                  🚀 Code Execution
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
                  ✏️ Code Editing
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
                  🧭 Navigation
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
                  <ShortcutItem 
                    keys={['Ctrl', '1-9']} 
                    description="Switch to language" 
                    theme={theme} 
                  />
                </div>
              </div>

              {/* Utilities */}
              <div>
                <h3 style={{ color: theme.text, margin: '0 0 12px 0', fontSize: '16px' }}>
                  🛠️ Utilities
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
                💡 Tip: Press <kbd style={{
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
