import React, { useEffect, useState, useRef, lazy, Suspense, useLayoutEffect, useMemo, useCallback } from 'react'
import '@excalidraw/excalidraw/index.css'
import Editor from '@monaco-editor/react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { AgentPanel } from './components/AgentPanel'

// ===== SVG Icon Components - Replace emojis with clean icons =====
const IconPlay = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
)

const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)

const IconArrowLeft = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12,19 5,12 12,5"/>
  </svg>
)

const IconArrowRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12,5 19,12 12,19"/>
  </svg>
)

const IconRefresh = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,4 23,10 17,10"/>
    <path d="M20.49,15A9,9,0,1,1,21,12"/>
  </svg>
)

const IconUsers = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17,21v-2a4,4,0,0,0-4-4H5a4,4,0,0,0-4,4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23,21v-2a4,4,0,0,0-3-3.87"/>
    <path d="M16,3.13a4,4,0,0,1,0,7.75"/>
  </svg>
)

const IconChevronLeft = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6"/>
  </svg>
)

const IconChevronRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,6 15,12 9,18"/>
  </svg>
)

const IconX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconFileText = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V8Z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
)

const IconMonitor = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)

const IconBook = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4,19.5A2.5,2.5,0,0,1,6.5,17H20"/>
    <path d="M6.5,2H20V22H6.5A2.5,2.5,0,0,1,4,19.5v-15A2.5,2.5,0,0,1,6.5,2Z"/>
  </svg>
)

const IconMoon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21,12.79A9,9,0,1,1,11.21,3,7,7,0,0,0,21,12.79Z"/>
  </svg>
)

const IconSun = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const IconPlus = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconCpu = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/>
    <line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/>
    <line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/>
    <line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/>
    <line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
)

const IconSparkles = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L14.12 8.5L20 9.27L15.82 13.14L17 19L12 16L7 19L8.18 13.14L4 9.27L9.88 8.5L12 3Z"/>
  </svg>
)

const IconSearch = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const IconPackage = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21,16V8a2,2,0,0,0-1-1.73l-7-4a2,2,0,0,0-2,0l-7,4A2,2,0,0,0,3,8v8a2,2,0,0,0,1,1.73l7,4a2,2,0,0,0,2,0l7-4A2,2,0,0,0,21,16Z"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const IconAlertTriangle = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29,3.86,1.82,18a2,2,0,0,0,1.71,3H20.47a2,2,0,0,0,1.71-3L13.71,3.86A2,2,0,0,0,10.29,3.86Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconLightbulb = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9,18h6"/>
    <path d="M10,22h4"/>
    <path d="M15.09,14c.18-.98.65-1.74,1.41-2.5A4.65,4.65,0,0,0,18,8,6,6,0,0,0,6,8c0,1,0,2,1.5,3.5.76.76,1.23,1.52,1.41,2.5"/>
  </svg>
)

const IconZap = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
  </svg>
)

const IconRobot = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <circle cx="8" cy="16" r="1" fill="currentColor"/>
    <circle cx="16" cy="16" r="1" fill="currentColor"/>
  </svg>
)
// ===== End SVG Icon Components =====

// Lazy load Excalidraw to prevent blocking main thread
const Excalidraw = lazy(() => 
  import('@excalidraw/excalidraw')
    .then(module => ({ default: module.Excalidraw }))
    .catch(err => {
      console.error('Failed to load Excalidraw:', err)
      throw err
    })
)

// CeesarCode Logo Component
const CeesarCodeLogo = ({ theme, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      transition: 'opacity 0.2s ease',
      textDecoration: 'none'
    }}
    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
  >
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
      
      {/* Stylized "C" letter */}
      <path
        d="M 20 12 C 15 12 12 15 12 20 C 12 25 15 28 20 28"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Code brackets decoration */}
      <path
        d="M 26 14 L 24 16 L 26 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 14 22 L 16 24 L 14 26"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      lineHeight: '1.2'
    }}>
      <span style={{
        fontSize: '20px',
        fontWeight: '700',
        color: theme.text,
        letterSpacing: '-0.5px',
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        CeesarCode
      </span>
      <span style={{
        fontSize: '10px',
        color: theme.textSecondary,
        fontWeight: '500',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        Technical Interview Practice
      </span>
    </div>
  </div>
)

// Error boundary for Excalidraw
class ExcalidrawErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Excalidraw Error:', error, errorInfo)
    console.error('Error stack:', error.stack)
    console.error('Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '20px',
          color: this.props.theme.error,
          fontSize: '14px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '600' }}>
            Failed to load drawing canvas
          </div>
          <div style={{ color: this.props.theme.textSecondary, fontSize: '12px' }}>
            {this.state.error?.message || 'An error occurred while loading Excalidraw'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: this.props.theme.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Top-level error boundary
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo)
    console.error('Error stack:', error.stack)
    console.error('Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '40px',
          backgroundColor: '#f5f5f5',
          color: '#d32f2f',
          fontSize: '16px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '16px', fontSize: '24px', fontWeight: '600' }}>
            Something went wrong
          </div>
          <div style={{ color: '#666', fontSize: '14px', maxWidth: '600px', marginBottom: '8px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <div style={{ color: '#999', fontSize: '12px', maxWidth: '600px', fontFamily: 'monospace', marginTop: '12px' }}>
            Check the browser console for more details
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              backgroundColor: '#2563EB',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  light: {
    primary: '#2563EB', // Modern blue
    secondary: '#F9FAFB', // Off-white
    accent: '#1E40AF', // Darker blue
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceHover: '#F3F4F6',
    hover: '#EFF6FF', // Light blue hover
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    borderHover: '#D1D5DB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    codeBackground: '#FAFAFA',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
    gradientAccent: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
  },
  dark: {
    primary: '#3B82F6', // Brighter blue for dark mode
    secondary: '#1F2937', // Dark grey
    accent: '#60A5FA', // Light blue
    background: '#0F172A', // Darker slate background
    surface: '#1E293B', // Slate surface
    surfaceHover: '#334155',
    hover: 'rgba(59, 130, 246, 0.1)', // Blue tinted hover
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    borderHover: '#475569',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    codeBackground: '#0F172A',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    gradientAccent: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)'
  }
}

// Terminal component using xterm.js (output only)
const TerminalComponent = ({ output, theme, isDarkMode, version }) => {
  const terminalRef = useRef(null)
  const terminalInstanceRef = useRef(null)
  const fitAddonRef = useRef(null)
  const isReadyRef = useRef(false)
  const placeholderMessage = 'Run your code to see output here...'

  useEffect(() => {
    if (!terminalRef.current) return

    const terminal = new Terminal({
      theme: {
        background: isDarkMode ? '#1E1E1E' : '#0D1117',
        foreground: isDarkMode ? '#D4D4D4' : '#C9D1D9',
        cursor: isDarkMode ? '#D4D4D4' : '#C9D1D9',
        selection: isDarkMode ? '#264F78' : '#264F78',
        black: '#000000',
        red: '#CD3131',
        green: '#0DBC79',
        yellow: '#E5E510',
        blue: '#2472C8',
        magenta: '#BC3FBC',
        cyan: '#11A8CD',
        white: '#E5E5E5',
        brightBlack: '#666666',
        brightRed: '#F14C4C',
        brightGreen: '#23D18B',
        brightYellow: '#F5F543',
        brightBlue: '#3B8EEA',
        brightMagenta: '#D670D6',
        brightCyan: '#29B8DB',
        brightWhite: '#E5E5E5'
      },
      fontSize: 13,
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
      lineHeight: 1.5,
      cursorBlink: false,
      cursorStyle: 'block',
      scrollback: 2000,
      convertEol: true,
      allowTransparency: true,
      rendererType: 'canvas',
      disableStdin: true
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(terminalRef.current)

    const initialize = () => {
      if (!fitAddonRef.current) return
      fitAddon.fit()
      isReadyRef.current = true
    }
    // Fit after the terminal is mounted per xterm.js guidelines
    requestAnimationFrame(initialize)

    terminalInstanceRef.current = terminal
    fitAddonRef.current = fitAddon

    const handleResize = () => {
      if (isReadyRef.current && fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      isReadyRef.current = false
      terminal.dispose()
      terminalInstanceRef.current = null
      fitAddonRef.current = null
    }
  }, [isDarkMode])

  useEffect(() => {
    if (!terminalInstanceRef.current || !isReadyRef.current) return

    const term = terminalInstanceRef.current
    term.reset()

    const normalized = (output ?? placeholderMessage)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')

    normalized.forEach(line => {
      term.writeln(line)
    })
    term.scrollToBottom()
  }, [output, version])

  useEffect(() => {
    if (!isReadyRef.current || !fitAddonRef.current) return
    requestAnimationFrame(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    })
  }, [output, version])

  return (
    <div ref={terminalRef} style={{ width: '100%', height: '100%', boxSizing: 'border-box' }} />
  )
}

// JupyterLite component for ML notebook functionality
const JupyterLiteNotebook = React.memo(({ isDarkMode, theme }) => {
  const iframeRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useEmbedded, setUseEmbedded] = useState(true)

  // JupyterLite CDN URL - uses the official JupyterLite deployment
  const jupyterLiteUrl = 'https://jupyterlite.github.io/demo/lab/index.html'
  
  // Memoize the pyodide notebook content to prevent recreation on every render
  const pyodideNotebookContent = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Python Notebook</title>
      <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: ${isDarkMode ? '#1E1E1E' : '#FFFFFF'};
          color: ${isDarkMode ? '#D4D4D4' : '#1F2937'};
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          padding: 12px 16px;
          background: ${isDarkMode ? '#252526' : '#F3F4F6'};
          border-bottom: 1px solid ${isDarkMode ? '#3C3C3C' : '#E5E7EB'};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .status { font-size: 12px; color: ${isDarkMode ? '#888' : '#6B7280'}; }
        .status.ready { color: #10B981; }
        .status.loading { color: #F59E0B; }
        .toolbar { display: flex; gap: 8px; }
        .btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary { background: #3B82F6; color: white; }
        .btn-primary:hover { background: #2563EB; }
        .btn-primary:disabled { background: #9CA3AF; cursor: not-allowed; }
        .btn-secondary { background: ${isDarkMode ? '#374151' : '#E5E7EB'}; color: ${isDarkMode ? '#D4D4D4' : '#1F2937'}; }
        .btn-secondary:hover { background: ${isDarkMode ? '#4B5563' : '#D1D5DB'}; }
        .cells { flex: 1; overflow-y: auto; padding: 16px; }
        .cell {
          margin-bottom: 16px;
          border: 1px solid ${isDarkMode ? '#3C3C3C' : '#E5E7EB'};
          border-radius: 8px;
          overflow: hidden;
        }
        .cell-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: ${isDarkMode ? '#2D2D30' : '#F9FAFB'};
          border-bottom: 1px solid ${isDarkMode ? '#3C3C3C' : '#E5E7EB'};
        }
        .cell-info { display: flex; align-items: center; gap: 8px; }
        .cell-num { font-size: 12px; color: ${isDarkMode ? '#888' : '#6B7280'}; font-family: monospace; }
        .cell-actions { display: flex; gap: 4px; }
        .cell-btn {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          background: ${isDarkMode ? '#374151' : '#E5E7EB'};
          color: ${isDarkMode ? '#D4D4D4' : '#374151'};
        }
        .cell-btn:hover { background: ${isDarkMode ? '#4B5563' : '#D1D5DB'}; }
        .cell-btn.run { background: #3B82F6; color: white; }
        .cell-btn.run:hover { background: #2563EB; }
        .code-input {
          width: 100%;
          padding: 12px;
          border: none;
          background: ${isDarkMode ? '#1E1E1E' : '#FFFFFF'};
          color: ${isDarkMode ? '#D4D4D4' : '#1F2937'};
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
          min-height: 80px;
          outline: none;
        }
        .output {
          padding: 12px;
          background: ${isDarkMode ? '#252526' : '#F9FAFB'};
          border-top: 1px solid ${isDarkMode ? '#3C3C3C' : '#E5E7EB'};
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 13px;
          white-space: pre-wrap;
          max-height: 300px;
          overflow-y: auto;
        }
        .output.error { color: #EF4444; }
        .output.success { color: #10B981; }
        .packages-info {
          padding: 12px;
          background: ${isDarkMode ? '#1E3A5F' : '#EFF6FF'};
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 12px;
          color: ${isDarkMode ? '#93C5FD' : '#1D4ED8'};
        }
        .packages-info strong { display: block; margin-bottom: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">
          <span>🐍</span>
          <span>Python Notebook</span>
          <span id="status" class="status loading">Loading Python...</span>
        </div>
        <div class="toolbar">
          <button class="btn btn-primary" id="runAll" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right:4px;vertical-align:middle"><polygon points="5,3 19,12 5,21"/></svg> Run All</button>
          <button class="btn btn-secondary" id="addCell">+ Add Cell</button>
          <button class="btn btn-secondary" id="clearAll">Clear All</button>
        </div>
      </div>
      <div class="cells" id="cells">
        <div class="packages-info">
          <strong><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21,16V8a2,2,0,0,0-1-1.73l-7-4a2,2,0,0,0-2,0l-7,4A2,2,0,0,0,3,8v8a2,2,0,0,0,1,1.73l7,4a2,2,0,0,0,2,0l7-4A2,2,0,0,0,21,16Z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Available Packages:</strong>
          numpy, pandas, scikit-learn, matplotlib, scipy, sympy, networkx, and more.
          Use <code>import micropip; await micropip.install('package')</code> to install additional packages.
        </div>
      </div>
      <script>
        let pyodide = null;
        let cellCount = 0;
        const cells = [];
        
        async function initPyodide() {
          try {
            pyodide = await loadPyodide();
            await pyodide.loadPackage(['numpy', 'pandas', 'scikit-learn', 'matplotlib', 'micropip']);
            
            // Setup matplotlib for inline display
            await pyodide.runPythonAsync(\`
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
import io
import base64

def show_plot():
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode()
    plt.close()
    return f'<img src="data:image/png;base64,{img_str}" />'
            \`);
            
            document.getElementById('status').textContent = 'Ready';
            document.getElementById('status').className = 'status ready';
            document.getElementById('runAll').disabled = false;
            addCell();
          } catch (err) {
            document.getElementById('status').textContent = 'Error: ' + err.message;
            document.getElementById('status').className = 'status error';
          }
        }
        
        function addCell(code = '') {
          cellCount++;
          const cellId = 'cell-' + cellCount;
          const cellDiv = document.createElement('div');
          cellDiv.className = 'cell';
          cellDiv.id = cellId;
          cellDiv.innerHTML = \`
            <div class="cell-header">
              <div class="cell-info">
                <span class="cell-num">In [\${cellCount}]:</span>
              </div>
              <div class="cell-actions">
                <button class="cell-btn run" onclick="runCell('\${cellId}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right:4px;vertical-align:middle"><polygon points="5,3 19,12 5,21"/></svg>Run</button>
                <button class="cell-btn" onclick="clearCell('\${cellId}')">Clear</button>
                <button class="cell-btn" onclick="deleteCell('\${cellId}')">×</button>
              </div>
            </div>
            <textarea class="code-input" id="\${cellId}-code" placeholder="Enter Python code...">\${code}</textarea>
            <div class="output" id="\${cellId}-output" style="display: none;"></div>
          \`;
          document.getElementById('cells').appendChild(cellDiv);
          cells.push(cellId);
          
          // Add Shift+Enter handler
          const textarea = document.getElementById(cellId + '-code');
          textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.shiftKey) {
              e.preventDefault();
              runCell(cellId);
            }
          });
        }
        
        async function runCell(cellId) {
          if (!pyodide) return;
          const codeEl = document.getElementById(cellId + '-code');
          const outputEl = document.getElementById(cellId + '-output');
          const code = codeEl.value;
          
          outputEl.style.display = 'block';
          outputEl.className = 'output';
          outputEl.textContent = 'Running...';
          
          try {
            // Redirect stdout
            await pyodide.runPythonAsync(\`
import sys
from io import StringIO
_stdout = sys.stdout
sys.stdout = StringIO()
            \`);
            
            const result = await pyodide.runPythonAsync(code);
            
            // Get stdout content
            const stdout = await pyodide.runPythonAsync(\`
_output = sys.stdout.getvalue()
sys.stdout = _stdout
_output
            \`);
            
            let output = stdout || '';
            if (result !== undefined && result !== null) {
              const resultStr = result.toString ? result.toString() : String(result);
              if (resultStr && resultStr !== 'undefined' && resultStr !== 'None') {
                output += (output ? '\\n' : '') + resultStr;
              }
            }
            
            // Check for plot
            if (code.includes('plt.') && !code.includes('plt.close()')) {
              try {
                const plotHtml = await pyodide.runPythonAsync('show_plot()');
                outputEl.innerHTML = (output ? '<pre>' + output + '</pre>' : '') + plotHtml;
              } catch (e) {
                outputEl.textContent = output || '(Cell executed)';
              }
            } else {
              outputEl.textContent = output || '(Cell executed)';
            }
            outputEl.className = 'output success';
          } catch (err) {
            outputEl.textContent = err.message;
            outputEl.className = 'output error';
          }
        }
        
        async function runAllCells() {
          for (const cellId of cells) {
            await runCell(cellId);
          }
        }
        
        function clearCell(cellId) {
          document.getElementById(cellId + '-code').value = '';
          const outputEl = document.getElementById(cellId + '-output');
          outputEl.style.display = 'none';
          outputEl.textContent = '';
        }
        
        function deleteCell(cellId) {
          if (cells.length <= 1) return;
          const idx = cells.indexOf(cellId);
          if (idx > -1) {
            cells.splice(idx, 1);
            document.getElementById(cellId).remove();
          }
        }
        
        function clearAllCells() {
          cells.forEach(cellId => {
            document.getElementById(cellId + '-code').value = '';
            const outputEl = document.getElementById(cellId + '-output');
            outputEl.style.display = 'none';
            outputEl.textContent = '';
          });
        }
        
        document.getElementById('runAll').onclick = runAllCells;
        document.getElementById('addCell').onclick = () => addCell();
        document.getElementById('clearAll').onclick = clearAllCells;
        
        initPyodide();
      </script>
    </body>
    </html>
  `, [isDarkMode])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setError('Failed to load notebook environment')
    setIsLoading(false)
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF'
    }}>
      {/* Header with mode toggle */}
      <div style={{
        padding: '8px 16px',
        borderBottom: `1px solid ${isDarkMode ? '#3C3C3C' : '#E5E7EB'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#252526' : '#F9FAFB',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#D4D4D4' : '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconCpu size={16} /> ML Notebook
          </span>
          {isLoading && (
            <span style={{ fontSize: '12px', color: '#F59E0B' }}>
              Loading Python environment...
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setUseEmbedded(!useEmbedded)}
            style={{
              padding: '4px 10px',
              backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
              color: isDarkMode ? '#D4D4D4' : '#374151',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {useEmbedded ? 'Open JupyterLite' : 'Use Embedded'}
          </button>
        </div>
      </div>
      
      {/* Notebook content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: isDarkMode ? '#F87171' : '#EF4444',
            textAlign: 'center',
            padding: '20px'
          }}>
            <span style={{ display: 'block', marginBottom: '16px' }}><IconAlertTriangle size={48} /></span>
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null)
                setIsLoading(true)
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: theme.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            srcDoc={useEmbedded ? pyodideNotebookContent : undefined}
            src={useEmbedded ? undefined : jupyterLiteUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF'
            }}
            title="Python ML Notebook"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        )}
      </div>
    </div>
  )
})

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

// Map language names to Monaco Editor language IDs
const getMonacoLanguage = (language) => {
  const languageMap = {
    python: 'python',
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    kotlin: 'kotlin',
    scala: 'scala',
    go: 'go',
    rust: 'rust',
    swift: 'swift',
    ruby: 'ruby',
    javascript: 'javascript',
    typescript: 'typescript',
    bash: 'shell',
    sh: 'shell',
    sql: 'sql'
  }
  return languageMap[language] || 'plaintext'
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

function AppContent() {
  const [problems, setProblems] = useState([])
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [selectedPart, setSelectedPart] = useState(0) // 0 for part 1, 1 for part 2, etc.
  const [selectedLanguage, setSelectedLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [partCodes, setPartCodes] = useState({}) // Store code for each part: { 0: 'code1', 1: 'code2', ... }
  const [submittedParts, setSubmittedParts] = useState({}) // Track which parts have been submitted: { 0: true, 1: true, ... }
  const [result, setResultState] = useState(null)
  const [consoleVersion, setConsoleVersion] = useState(0)
  const setResult = useCallback((value) => {
    setResultState(value)
    setConsoleVersion(prev => prev + 1)
  }, [setResultState, setConsoleVersion])
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    const saved = localStorage.getItem('ceesarcode-dark-mode')
    return saved ? JSON.parse(saved) : false
  })
  
  // Use ref to track Excalidraw data to prevent infinite loops
  const excalidrawDataRef = useRef('')
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
    stub: { python: '' },
    type: 'coding', // 'coding' or 'system_design'
    drawingData: '', // Excalidraw drawing data
    isMultiPart: false, // Whether this is a multi-part question
    parts: [] // Array of parts for multi-part questions (Part 2, Part 3, etc.)
  })
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Agent panel state for AI pair programming
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false)
  
  // Search and sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('none') // 'none', 'name', 'type'
  const [sortDirection, setSortDirection] = useState('asc') // 'asc', 'desc'
  
  // Memoized filtered and sorted problems list
  // Uses optimized algorithms:
  // - Search: O(n) case-insensitive substring matching
  // - Sort: JavaScript's Timsort algorithm O(n log n)
  const filteredAndSortedProblems = useMemo(() => {
    let result = [...problems]
    
    // Filter by search query (case-insensitive substring match)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(problem => {
        const title = (problem.Title || problem.title || '').toLowerCase()
        const type = (problem.Type || problem.type || 'coding').toLowerCase()
        // Search in both title and type
        return title.includes(query) || type.includes(query)
      })
    }
    
    // Sort by field if specified
    if (sortField !== 'none') {
      result.sort((a, b) => {
        let valueA, valueB
        
        if (sortField === 'name') {
          valueA = (a.Title || a.title || '').toLowerCase()
          valueB = (b.Title || b.title || '').toLowerCase()
        } else if (sortField === 'type') {
          valueA = (a.Type || a.type || 'coding').toLowerCase()
          valueB = (b.Type || b.type || 'coding').toLowerCase()
        }
        
        // Use localeCompare for proper string comparison
        const comparison = valueA.localeCompare(valueB)
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }
    
    return result
  }, [problems, searchQuery, sortField, sortDirection])
  
  // Save system design drawing to backend
  const saveSystemDesignDrawing = async (problemId, drawingData) => {
    try {
      const response = await fetch(`/api/problems/${problemId}/drawing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawingData })
      })
      if (!response.ok) throw new Error('Failed to save drawing')
      // Update local state
      setSelectedProblem(prev => prev ? {...prev, DrawingData: drawingData} : null)
    } catch (err) {
      console.error('Error saving drawing:', err)
    }
  }
  
  // Delete a problem
  const deleteProblem = async (problemId) => {
    try {
      console.log('Deleting problem:', problemId)
      const response = await fetch(`/api/problems/${problemId}`, {
        method: 'DELETE'
      })
      
      console.log('Delete response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Delete error response:', errorText)
        throw new Error(`Failed to delete problem (${response.status}): ${errorText}`)
      }
      
      // Remove from local state
      setProblems(prev => prev.filter(p => (p.ID || p.id) !== problemId))
      
      // Clear selection if deleted problem was selected
      if (selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemId) {
        setSelectedProblem(null)
        setCode('')
        setResult(null)
      }
      
      console.log('Problem deleted successfully')
    } catch (err) {
      console.error('Error deleting problem:', err)
      alert('Failed to delete problem: ' + err.message)
    }
  }
  
  // Memoized callback for Excalidraw changes to prevent infinite loops
  const handleExcalidrawChange = React.useCallback((elements, appState, files) => {
    try {
      // Create a clean copy of appState without the collaborators Map (can't be serialized)
      const cleanAppState = { ...appState }
      delete cleanAppState.collaborators
      
      const drawingData = JSON.stringify({ elements, appState: cleanAppState, files })
      // Only update if data actually changed
      if (excalidrawDataRef.current !== drawingData) {
        excalidrawDataRef.current = drawingData
        // Save to the selected problem
        if (selectedProblem) {
          saveSystemDesignDrawing(selectedProblem.ID, drawingData)
        }
      }
    } catch (err) {
      console.error('Failed to save drawing data:', err)
    }
  }, [selectedProblem])
  
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
    companyDescription: '',
    interviewType: '', // Type or description of the interview
    provider: 'gemini', // 'gemini', 'openai', 'claude'
    apiKey: '', // API key from UI (for production)
    defaultLanguage: 'python', // Default programming language for generated questions
    questionType: 'coding', // 'coding' or 'system_design'
    includeMultiPart: false // Whether to generate multi-part questions
  })
  const [useCustomRole, setUseCustomRole] = useState(false)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [agentResult, setAgentResult] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Always start with sidebar visible (not collapsed)
    return false
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
  const problemHeaderRef = useRef(null)
  const [problemHeaderMetrics, setProblemHeaderMetrics] = useState({ top: 56, height: 32 })
  useLayoutEffect(() => {
    if (sidebarCollapsed) return

    const updateHeaderMetrics = () => {
      if (!problemHeaderRef.current) return
      const rect = problemHeaderRef.current.getBoundingClientRect()
      setProblemHeaderMetrics({
        top: rect.top,
        height: rect.height || 32
      })
    }

    updateHeaderMetrics()
    window.addEventListener('resize', updateHeaderMetrics)
    window.addEventListener('scroll', updateHeaderMetrics, true)

    return () => {
      window.removeEventListener('resize', updateHeaderMetrics)
      window.removeEventListener('scroll', updateHeaderMetrics, true)
    }
  }, [sidebarCollapsed, leftPaneWidth, selectedProblem])
  const [consoleHeight, setConsoleHeight] = useState(() => {
    const saved = localStorage.getItem('ceesarcode-console-height')
    return saved ? parseInt(saved) : 200
  })
  // Autocomplete state
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([])
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })
  const [autocompleteSelectedIndex, setAutocompleteSelectedIndex] = useState(0)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompletePrefix, setAutocompletePrefix] = useState('')
  const [autocompleteWordStart, setAutocompleteWordStart] = useState(0)
  const [autocompleteWordEnd, setAutocompleteWordEnd] = useState(0)
  
  // Cursor position tracking
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 })
  const cursorPositionRef = useRef({ start: 0, end: 0 })

  const [consoleCollapsed, setConsoleCollapsed] = useState(() => {
    const saved = localStorage.getItem('ceesarcode-console-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const [isResizingPanes, setIsResizingPanes] = useState(false)
  const [isResizingConsole, setIsResizingConsole] = useState(false)
  

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
  const collapsedButtonTop = problemHeaderMetrics.top + (problemHeaderMetrics.height - 24) / 2

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
    
    // Handle code loading for multi-part questions
    const isMultiPart = selectedProblem && (selectedProblem.IsMultiPart || selectedProblem.isMultiPart)
    const parts = selectedProblem && (selectedProblem.Parts || selectedProblem.parts || [])
    
    if (isMultiPart && parts.length > 0) {
      // Save current code before switching
      setPartCodes(prev => ({
        ...prev,
        [selectedPart]: code
      }))
      
      // Load code for new language
      if (selectedPart === 0) {
        // Main part (Part 1)
        if (selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
          setCode(partCodes[0] || selectedProblem.Stub[newLanguage])
        } else {
          setCode(partCodes[0] || getDefaultStubForLanguage(newLanguage))
        }
      } else {
        // Additional part (Part 2, 3, etc.)
        const part = parts[selectedPart - 1]
        const partStub = part.stub || part.Stub || {}
        if (partStub[newLanguage]) {
          setCode(partCodes[selectedPart] || partStub[newLanguage])
        } else {
          setCode(partCodes[selectedPart] || getDefaultStubForLanguage(newLanguage))
        }
      }
    } else {
      // Single-part question
    // Load stub code for the new language
    if (selectedProblem && selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
      setCode(selectedProblem.Stub[newLanguage])
    } else {
      setCode(getDefaultStubForLanguage(newLanguage))
      }
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

    // Validate that API key is provided
    if (!agentRequest.apiKey || agentRequest.apiKey.trim() === '') {
      const providerName = agentRequest.provider === 'gemini' ? 'Gemini' : 
                          agentRequest.provider === 'openai' ? 'OpenAI' : 'Claude'
      alert(`Please enter your ${providerName} API key to generate questions.\n\nYou can get a free API key from:\n${
        agentRequest.provider === 'gemini' ? '• Google AI Studio: https://aistudio.google.com/app/apikey' :
        agentRequest.provider === 'openai' ? '• OpenAI Platform: https://platform.openai.com/api-keys' :
        '• Anthropic Console: https://console.anthropic.com/settings/keys'
      }`)
      return
    }

    // Ensure count is valid
    const count = agentRequest.count && !isNaN(parseInt(agentRequest.count)) ? parseInt(agentRequest.count) : 3
    const questionCount = Math.max(1, Math.min(10, count))
    const requestData = {
      company: agentRequest.company,
      role: role, // Use the selected or custom role
      level: agentRequest.level,
      count: questionCount,
      jobDescription: agentRequest.jobDescription || '',
      companyDescription: agentRequest.companyDescription || '',
      interviewType: agentRequest.interviewType || '',
      provider: agentRequest.provider || 'gemini',
      apiKey: agentRequest.apiKey || '', // Send API key if provided
      defaultLanguage: agentRequest.defaultLanguage || 'python', // Default language for generated questions
      questionType: agentRequest.questionType || 'coding', // Question type: coding or system_design
      includeMultiPart: agentRequest.includeMultiPart || false // Whether to include multi-part questions
    }
    
    console.log('Sending request:', { ...requestData, apiKey: requestData.apiKey ? '***' + requestData.apiKey.slice(-4) : 'empty' })

    setIsGeneratingQuestions(true)
    setAgentResult(null)
    setError(null)

    // Calculate adaptive timeout based on question count
    // Base timeout: 90 seconds, plus 45 seconds per question, max 15 minutes
    // For 10 questions: 90 + (10 * 45) = 540 seconds = 9 minutes
    const timeoutMs = Math.min(900000, 90000 + (questionCount * 45000))
    const timeoutMinutes = Math.round(timeoutMs / 60000 * 10) / 10
    console.log(`Setting timeout to ${timeoutMinutes} minutes for ${questionCount} question(s)`)

    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const result = await response.json()
      
      if (!response.ok) {
        console.error('API error response:', result)
        throw new Error(result.message || `HTTP error! status: ${response.status}`)
      }
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
        console.error('AI generation error:', result)
        alert(`Error: ${result.message || 'Failed to generate questions. Please check your API key and try again.'}`)
      }
    } catch (err) {
      console.error('Error generating questions:', err)
      if (err.name === 'AbortError') {
        const timeoutMinutes = Math.round(timeoutMs / 60000 * 10) / 10
        setError(`Request timed out after ${timeoutMinutes} minutes. The AI generation is taking longer than expected. Try generating fewer questions at once or check your internet connection.`)
        alert(`Request timed out after ${timeoutMinutes} minutes. Try generating fewer questions at once (e.g., 3-5 questions) or check your internet connection.`)
      } else {
        setError(err.message)
        alert('Failed to generate questions: ' + err.message)
      }
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
    // This function is now mainly for Jupyter cells (textarea)
    // Monaco Editor handles its own keyboard shortcuts
    
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
    
    // Handle auto-closing brackets, parentheses, and quotes
    // Also handle smart skipping of closing brackets/quotes
    if (['(', '[', '{', '"', "'", ')', ']', '}'].includes(e.key)) {
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

  // Apply autocomplete suggestion
  const applyAutocomplete = (suggestion) => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return
    
    const start = autocompleteWordStart
    const end = autocompleteWordEnd
    
    // Replace the prefix with the full suggestion
    const newCode = code.substring(0, start) + suggestion.value + code.substring(end)
    
    // If it's a module that needs import, add the import
    let finalCode = newCode
    if (suggestion.needsImport) {
      finalCode = addImportIfNeeded(suggestion.value, selectedLanguage, newCode)
    }
    
    setCode(finalCode)
    
    // Update cursor position
    const newCursorPos = start + suggestion.value.length
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
    
    // Hide autocomplete
    setShowAutocomplete(false)
  }

  // Scroll textarea to keep cursor visible
  const scrollToCursor = (textarea, cursorPos) => {
    if (!textarea) return
    
    // Get text before cursor to calculate line number
    const textBeforeCursor = code.substring(0, cursorPos)
    const lines = textBeforeCursor.split('\n')
    const currentLine = lines.length - 1
    
    // Calculate line height
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 22.4
    const textareaPadding = 16
    
    // Calculate the position of the current line
    const lineTop = currentLine * lineHeight + textareaPadding
    const lineBottom = lineTop + lineHeight
    
    // Get visible area
    const scrollTop = textarea.scrollTop
    const scrollBottom = scrollTop + textarea.clientHeight
    
    // Scroll if cursor line is above or below visible area
    if (lineTop < scrollTop) {
      // Cursor is above visible area, scroll up
      textarea.scrollTop = Math.max(0, lineTop - lineHeight)
    } else if (lineBottom > scrollBottom) {
      // Cursor is below visible area, scroll down
      textarea.scrollTop = lineBottom - textarea.clientHeight + lineHeight
    }
  }

  // Handle code input changes
  const handleCodeChange = (newCode) => {
    setCode(newCode || '')
    // Save to part-specific storage for multi-part questions
    if (selectedProblem && (selectedProblem.IsMultiPart || selectedProblem.isMultiPart)) {
      setPartCodes(prev => ({
        ...prev,
        [selectedPart]: newCode || ''
      }))
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

  // Check if we're inside a comment (for context awareness)
  const isInsideComment = (text, position, language) => {
    const beforeCursor = text.substring(0, position)
    const lines = beforeCursor.split('\n')
    const currentLine = lines[lines.length - 1] || ''
    
    // Check for single-line comments
    const commentPatterns = {
      python: /#/,
      javascript: /\/\/|\/\*/,
      typescript: /\/\/|\/\*/,
      java: /\/\/|\/\*/,
      cpp: /\/\/|\/\*/,
      c: /\/\/|\/\*/,
      go: /\/\/|\/\*/,
      rust: /\/\/|\/\*/,
      ruby: /#/,
      bash: /#/,
      sh: /#/
    }
    
    const pattern = commentPatterns[language]
    if (!pattern) return false
    
    // Check if there's a comment marker before the cursor on this line
    const commentMatch = currentLine.match(pattern)
    if (commentMatch) {
      const commentIndex = currentLine.indexOf(commentMatch[0])
      const cursorInLine = currentLine.length
      // If comment is before cursor, we're in a comment
      if (commentIndex < cursorInLine) {
        // For multi-line comments, check if we're inside one
        if (commentMatch[0] === '/*') {
          const textBefore = text.substring(0, position)
          const lastOpen = textBefore.lastIndexOf('/*')
          const lastClose = textBefore.lastIndexOf('*/')
          return lastOpen > lastClose
        }
        return true
      }
    }
    
    return false
  }

  // Check if we're inside a string (better context awareness)
  const isInsideString = (text, position, quoteChar) => {
    const beforeCursor = text.substring(0, position)
    
    // Count unescaped quotes before cursor
    let quoteCount = 0
    let i = 0
    while (i < beforeCursor.length) {
      if (beforeCursor[i] === quoteChar && (i === 0 || beforeCursor[i-1] !== '\\')) {
        quoteCount++
      }
      i++
    }
    
    // If odd number of quotes, we're inside a string
    return quoteCount % 2 === 1
  }

  // Find the matching closing bracket/quote position
  const findMatchingClose = (text, position, openChar, closeChar) => {
    let depth = 1
    let i = position + 1
    
    while (i < text.length && depth > 0) {
      const char = text[i]
      const prevChar = i > 0 ? text[i - 1] : ''
      
      // Skip escaped characters
      if (prevChar === '\\') {
        i++
        continue
      }
      
      if (char === openChar) {
        depth++
      } else if (char === closeChar) {
        depth--
        if (depth === 0) {
          return i
        }
      }
      
      i++
    }
    
    return -1 // No matching close found
  }

  const handleAutoClose = (e) => {
    const textarea = e.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Don't auto-close if there's a selection
    if (start !== end) {
      return
    }
    
    const openingChars = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    }
    
    const closingChars = {
      ')': '(',
      ']': '[',
      '}': '{',
      '"': '"',
      "'": "'"
    }
    
    const closingChar = openingChars[e.key]
    const openingChar = closingChars[e.key]
    
    // Handle closing brackets/quotes (when user types a closing character)
    if (openingChar) {
      const afterCursor = code.substring(end)
      
      // If the next character is already the closing bracket/quote, check if we should skip it
      // Only skip if there are no unmatched opening brackets before the cursor
      if (afterCursor.charAt(0) === e.key) {
        // Check if there are unmatched opening brackets before the cursor
        // This handles cases like (min(1, value)) where we need to close the outer bracket
        const beforeCursor = code.substring(0, start)
        let unmatchedOpens = 0
        
        // Count unmatched opening brackets from the start
        for (let i = 0; i < beforeCursor.length; i++) {
          const char = beforeCursor[i]
          // Skip escaped characters
          if (i > 0 && beforeCursor[i - 1] === '\\') {
            continue
          }
          
          if (char === openingChar) {
            unmatchedOpens++
          } else if (char === e.key) {
            unmatchedOpens = Math.max(0, unmatchedOpens - 1)
          }
        }
        
        // If there are unmatched opening brackets, we need to close them, so don't skip
        if (unmatchedOpens === 0) {
          // No unmatched brackets, skip over the existing closing bracket
          e.preventDefault()
          setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(end + 1, end + 1)
          }, 0)
          return
        }
        // If unmatchedOpens > 0, allow the bracket to be inserted (fall through to default behavior)
      }
      
      // For quotes: if we're inside a string and type the same quote type, close the string
      if ((e.key === '"' || e.key === "'") && isInsideString(code, start, e.key)) {
        // Find the opening quote before cursor
        let openQuotePos = -1
        for (let i = start - 1; i >= 0; i--) {
          if (code[i] === e.key && (i === 0 || code[i - 1] !== '\\')) {
            openQuotePos = i
            break
          }
        }
        
        if (openQuotePos !== -1) {
          // Find the matching closing quote after the opening quote
          const matchingClosePos = findMatchingClose(code, openQuotePos, e.key, e.key)
          if (matchingClosePos !== -1 && matchingClosePos >= start) {
            // Move cursor to after the closing quote
            e.preventDefault()
            setTimeout(() => {
              textarea.focus()
              textarea.setSelectionRange(matchingClosePos + 1, matchingClosePos + 1)
            }, 0)
            return
          }
        }
        // If no matching close found, just insert the quote (close the string)
        return // Let default behavior happen
      }
    }
    
    // Handle opening brackets/quotes
    if (closingChar) {
      // Don't auto-close in comments
      if (isInsideComment(code, start, selectedLanguage)) {
        return
      }
      
      const afterCursor = code.substring(end)
      
      // For quotes, handle nested quote scenarios (works for all languages)
      if (e.key === '"' || e.key === "'") {
        const insideString = isInsideString(code, start, e.key)
        
        // If we're inside a string with the same quote type
        if (insideString) {
          // If next char is the closing quote, check if it's an empty quote pair
          if (afterCursor.charAt(0) === e.key) {
            // Check if we're inside an empty quote pair
            // Look backwards to find the matching opening quote
            const beforeCursor = code.substring(0, start)
            let foundMatchingOpen = false
            let matchingOpenIndex = -1
            
            // Count unescaped quotes backwards from cursor
            for (let i = beforeCursor.length - 1; i >= 0; i--) {
              const char = beforeCursor[i]
              // Skip escaped characters
              if (i > 0 && beforeCursor[i - 1] === '\\') {
                continue
              }
              
              if (char === e.key) {
                // Found matching opening quote
                foundMatchingOpen = true
                matchingOpenIndex = i
                break
              }
            }
            
            if (foundMatchingOpen && matchingOpenIndex !== -1) {
              // Check if there's any content between the opening quote and cursor
              const contentBetween = beforeCursor.substring(matchingOpenIndex + 1)
              const hasContent = contentBetween.trim().length > 0
              
              // If it's an empty quote pair (no content), allow nesting
              if (!hasContent) {
                // Allow the quote to be inserted (don't skip) - continue to insertion logic below
              } else {
                // There's content, so skip over the closing quote
                e.preventDefault()
                setTimeout(() => {
                  textarea.focus()
                  textarea.setSelectionRange(end + 1, end + 1)
                }, 0)
                return
              }
            } else {
              // No matching quote found, skip over the closing quote
              e.preventDefault()
              setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(end + 1, end + 1)
              }, 0)
              return
            }
          } else {
            // Next char is not the closing quote, we're inside a string - don't auto-close
            // This allows for escaped quotes or different quote types
            return // Let the default behavior happen
          }
        }
        
        // Check if we're inside a string with a different quote type
        // In that case, we can auto-close normally (e.g., 'he"llo' -> 'he""llo')
        const insideOtherString = (e.key === '"' && isInsideString(code, start, "'")) ||
                                   (e.key === "'" && isInsideString(code, start, '"'))
        if (insideOtherString) {
          // Different quote type, so we can auto-close normally
          // Continue to the auto-close logic below
        }
      }
      
      // For brackets: check if we're inside brackets of the same type
      // Nested brackets should work - e.g., (he(llo)) should allow (he(()llo))
      // We don't need special handling for nested brackets, they work naturally
      
      // Check if next character is already the closing character (smart bracket closing)
      // Only skip if we're NOT inside an empty bracket pair AND there are no unmatched opening brackets
      // If we're inside empty brackets like (), we should allow nesting
      if (afterCursor.charAt(0) === closingChar) {
        // First, check if there are unmatched opening brackets before the cursor
        // This handles cases like (min(1, value)) where we need to close the outer bracket
        const beforeCursor = code.substring(0, start)
        let unmatchedOpens = 0
        
        // Count unmatched opening brackets from the start
        for (let i = 0; i < beforeCursor.length; i++) {
          const char = beforeCursor[i]
          // Skip escaped characters
          if (i > 0 && beforeCursor[i - 1] === '\\') {
            continue
          }
          
          if (char === e.key) {
            unmatchedOpens++
          } else if (char === closingChar) {
            unmatchedOpens = Math.max(0, unmatchedOpens - 1)
          }
        }
        
        // If there are unmatched opening brackets, we need to close them, so don't skip
        if (unmatchedOpens > 0) {
          // Allow the bracket to be inserted to close an unmatched opening bracket
          // Continue to insertion logic below
        } else {
          // No unmatched brackets, check if we're inside an empty bracket pair
          // Look backwards to find the matching opening bracket
          let bracketDepth = 0
          let foundMatchingOpen = false
          let matchingOpenIndex = -1
          
          for (let i = beforeCursor.length - 1; i >= 0; i--) {
            const char = beforeCursor[i]
            // Skip escaped characters
            if (i > 0 && beforeCursor[i - 1] === '\\') {
              continue
            }
            
            if (char === closingChar) {
              bracketDepth++
            } else if (char === e.key) {
              if (bracketDepth === 0) {
                // Found matching opening bracket
                foundMatchingOpen = true
                matchingOpenIndex = i
                break
              } else {
                bracketDepth--
              }
            }
          }
          
          if (foundMatchingOpen && matchingOpenIndex !== -1) {
            // Check if there's any content between the opening bracket and cursor
            const contentBetween = beforeCursor.substring(matchingOpenIndex + 1)
            const hasContent = contentBetween.trim().length > 0
            
            // If it's an empty bracket pair (no content), allow nesting
            if (!hasContent) {
              // Allow the bracket to be inserted (don't skip) - continue to insertion logic below
            } else {
              // There's content, so skip over the closing bracket
              e.preventDefault()
              setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(end + 1, end + 1)
              }, 0)
              return
            }
          } else {
            // No matching bracket found, skip over the closing character
            e.preventDefault()
            setTimeout(() => {
              textarea.focus()
              textarea.setSelectionRange(end + 1, end + 1)
            }, 0)
            return
          }
        }
      }
      
      // Insert opening and closing characters
      // This works for nested brackets: (hello) -> (he()llo) when typing ( inside
      e.preventDefault()
      const newCode = code.substring(0, start) + e.key + closingChar + code.substring(end)
      setCode(newCode)
      
      // Set cursor position between the brackets/quotes
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + 1, start + 1)
      }, 0)
    }
  }

  // Extract variables and imports from code
  const extractCodeSymbols = (codeText, language) => {
    const symbols = {
      variables: new Set(),
      imports: new Set(),
      functions: new Set()
    }
    
    const lines = codeText.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Extract imports
      if (language === 'python') {
        const importMatch = trimmed.match(/^(?:from\s+(\S+)|import\s+(\S+))/)
        if (importMatch) {
          const module = importMatch[1] || importMatch[2]
          if (module) {
            // Extract individual imports
            module.split(',').forEach(m => {
              const name = m.trim().split(' as ')[0].split('.')[0]
              symbols.imports.add(name)
            })
          }
        }
      } else if (['javascript', 'typescript'].includes(language)) {
        const importMatch = trimmed.match(/import\s+(?:\{[^}]+\}|\*\s+as\s+(\w+)|(\w+))/)
        if (importMatch) {
          const name = importMatch[1] || importMatch[2]
          if (name) symbols.imports.add(name)
          // Also extract named imports
          const namedMatch = trimmed.match(/import\s+\{([^}]+)\}/)
          if (namedMatch) {
            namedMatch[1].split(',').forEach(n => {
              const name = n.trim().split(' as ')[0]
              symbols.imports.add(name)
            })
          }
        }
      }
      
      // Extract variables (simple patterns)
      const varPatterns = {
        python: /^\s*(?:self\.)?(\w+)\s*=/,
        javascript: /^\s*(?:const|let|var)\s+(\w+)\s*=/,
        typescript: /^\s*(?:const|let|var)\s+(\w+)\s*[:=]/,
        java: /^\s*(?:\w+\s+)?(\w+)\s*=/,
        cpp: /^\s*(?:\w+\s+)?(\w+)\s*=/,
        c: /^\s*(?:\w+\s+)?(\w+)\s*=/
      }
      
      const varPattern = varPatterns[language]
      if (varPattern) {
        const varMatch = trimmed.match(varPattern)
        if (varMatch) {
          symbols.variables.add(varMatch[1])
        }
      }
      
      // Extract function names and parameters
      if (language === 'python') {
        // Python: def func(param1, param2):
        const funcMatch = trimmed.match(/^\s*def\s+(\w+)\s*\(([^)]*)\)/)
        if (funcMatch) {
          const funcName = funcMatch[1]
          if (funcName) symbols.functions.add(funcName)
          // Extract parameters
          const params = funcMatch[2]
          if (params) {
            params.split(',').forEach(param => {
              const paramName = param.trim().split('=')[0].trim().split(':')[0].trim()
              if (paramName && /^\w+$/.test(paramName)) {
                symbols.variables.add(paramName)
              }
            })
          }
        }
        // Also handle lambda: lambda x, y: ...
        const lambdaMatch = trimmed.match(/lambda\s+([^:]+):/)
        if (lambdaMatch) {
          const params = lambdaMatch[1]
          params.split(',').forEach(param => {
            const paramName = param.trim()
            if (paramName && /^\w+$/.test(paramName)) {
              symbols.variables.add(paramName)
            }
          })
        }
      } else if (['javascript', 'typescript'].includes(language)) {
        // JavaScript/TypeScript: function func(param1, param2) { ... }
        const funcDeclMatch = trimmed.match(/^\s*function\s+(\w+)\s*\(([^)]*)\)/)
        if (funcDeclMatch) {
          const funcName = funcDeclMatch[1]
          if (funcName) symbols.functions.add(funcName)
          // Extract parameters
          const params = funcDeclMatch[2]
          if (params) {
            params.split(',').forEach(param => {
              const paramName = param.trim().split('=')[0].trim().split(':')[0].trim()
              // Extract simple variable names (not destructured)
              if (paramName && /^\w+$/.test(paramName)) {
                symbols.variables.add(paramName)
              }
            })
          }
        }
        // Arrow functions: const func = (param1, param2) => or const func = param =>
        const arrowFuncMatch = trimmed.match(/^\s*(?:const|let|var)\s+(\w+)\s*[:=]\s*(?:async\s*)?(?:\(([^)]+)\)|(\w+))\s*=>/)
        if (arrowFuncMatch) {
          const funcName = arrowFuncMatch[1]
          if (funcName) symbols.functions.add(funcName)
          // Extract parameters
          const params = arrowFuncMatch[2] || arrowFuncMatch[3]
          if (params) {
            if (arrowFuncMatch[3]) {
              // Single parameter without parentheses
              const paramName = params.trim()
              if (paramName && /^\w+$/.test(paramName)) {
                symbols.variables.add(paramName)
              }
            } else {
              // Multiple parameters with parentheses
              params.split(',').forEach(param => {
                const paramName = param.trim().split('=')[0].trim().split(':')[0].trim()
                if (paramName && /^\w+$/.test(paramName)) {
                  symbols.variables.add(paramName)
                }
              })
            }
          }
        }
        // Standalone arrow functions: (param1, param2) => or param =>
        const arrowMatch = trimmed.match(/^\s*(?:\(([^)]+)\)|(\w+))\s*=>/)
        if (arrowMatch && !arrowFuncMatch) {
          const params = arrowMatch[1] || arrowMatch[2]
          if (params) {
            if (arrowMatch[2]) {
              // Single parameter without parentheses
              const paramName = params.trim()
              if (paramName && /^\w+$/.test(paramName)) {
                symbols.variables.add(paramName)
              }
            } else {
              // Multiple parameters with parentheses
              params.split(',').forEach(param => {
                const paramName = param.trim().split('=')[0].trim().split(':')[0].trim()
                if (paramName && /^\w+$/.test(paramName)) {
                  symbols.variables.add(paramName)
                }
              })
            }
          }
        }
      } else if (['java', 'cpp', 'c'].includes(language)) {
        // Java/C++/C: returnType funcName(param1, param2)
        const funcMatch = trimmed.match(/^\s*(?:\w+\s+)*\w+\s+(\w+)\s*\(([^)]*)\)/)
        if (funcMatch) {
          const funcName = funcMatch[1]
          if (funcName) symbols.functions.add(funcName)
          // Extract parameters
          const params = funcMatch[2]
          if (params) {
            params.split(',').forEach(param => {
              // Extract variable name from type name pattern
              const paramParts = param.trim().split(/\s+/)
              if (paramParts.length >= 2) {
                const paramName = paramParts[paramParts.length - 1].split('=')[0].trim()
                if (paramName && /^\w+$/.test(paramName)) {
                  symbols.variables.add(paramName)
                }
              } else if (paramParts.length === 1) {
                const paramName = paramParts[0].trim()
                if (paramName && /^\w+$/.test(paramName)) {
                  symbols.variables.add(paramName)
                }
              }
            })
          }
        }
      }
      
      // Extract for loop variables
      if (language === 'python') {
        // Python: for item in iterable: or for i, item in enumerate(...):
        const forMatch = trimmed.match(/^\s*for\s+([^:]+)\s+in\s+/)
        if (forMatch) {
          const loopVars = forMatch[1]
          loopVars.split(',').forEach(varPart => {
            const varName = varPart.trim()
            if (varName && /^\w+$/.test(varName)) {
              symbols.variables.add(varName)
            }
          })
        }
      } else if (['javascript', 'typescript'].includes(language)) {
        // JavaScript/TypeScript: for (let i = 0; ...) or for (const item of array) or for (item in object)
        const forMatch = trimmed.match(/^\s*for\s*\(\s*(?:const|let|var)?\s*(\w+)/)
        if (forMatch) {
          const loopVar = forMatch[1]
          if (loopVar) symbols.variables.add(loopVar)
        }
        // Also handle: for (const [key, value] of ...) - extract key and value
        const forOfMatch = trimmed.match(/^\s*for\s*\(\s*(?:const|let|var)?\s*\[([^\]]+)\]/)
        if (forOfMatch) {
          const destructured = forOfMatch[1]
          destructured.split(',').forEach(varPart => {
            const varName = varPart.trim()
            if (varName && /^\w+$/.test(varName)) {
              symbols.variables.add(varName)
            }
          })
        }
      } else if (['java', 'cpp', 'c'].includes(language)) {
        // Java/C++/C: for (int i = 0; ...) or for (Type var : collection)
        const forMatch = trimmed.match(/^\s*for\s*\(\s*(?:\w+\s+)?(\w+)/)
        if (forMatch) {
          const loopVar = forMatch[1]
          if (loopVar && loopVar !== 'int' && loopVar !== 'long' && loopVar !== 'double' && loopVar !== 'float' && loopVar !== 'char') {
            symbols.variables.add(loopVar)
          }
        }
        // Enhanced Java for-each: for (Type var : collection)
        const forEachMatch = trimmed.match(/^\s*for\s*\(\s*\w+\s+(\w+)\s*:/)
        if (forEachMatch) {
          const loopVar = forEachMatch[1]
          if (loopVar) symbols.variables.add(loopVar)
        }
      }
    }
    
    return symbols
  }

  const tryTabCompletion = (word, language) => {
    const keywords = getLanguageKeywords(language)
    const keywordMatches = keywords.filter(keyword => 
      keyword.toLowerCase().startsWith(word.toLowerCase()) && keyword.toLowerCase() !== word.toLowerCase()
    )
    
    // Also check variables and imports
    const symbols = extractCodeSymbols(code, language)
    const allSymbols = [...symbols.variables, ...symbols.imports, ...symbols.functions]
    const symbolMatches = allSymbols.filter(symbol => 
      symbol.toLowerCase().startsWith(word.toLowerCase()) && symbol.toLowerCase() !== word.toLowerCase()
    )
    
    const allMatches = [...keywordMatches, ...symbolMatches]
    
    if (allMatches.length === 1) {
      return allMatches[0]
    } else if (allMatches.length > 1) {
      // Find common prefix
      const commonPrefix = findCommonPrefix(allMatches)
      if (commonPrefix.length > word.length) {
        return commonPrefix
      }
    }
    
    // Template completion removed - no more autocorrect behavior
    
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

  // Get standard library modules for Python
  const getPythonStandardModules = () => {
    return [
      'heapq', 'collections', 'itertools', 'math', 'random', 'string', 're', 'json',
      'datetime', 'time', 'os', 'sys', 'pathlib', 'functools', 'operator', 'bisect',
      'array', 'copy', 'enum', 'typing', 'dataclasses', 'abc', 'contextlib', 'io',
      'pickle', 'sqlite3', 'csv', 'xml', 'html', 'urllib', 'http', 'socket', 'threading',
      'multiprocessing', 'asyncio', 'logging', 'unittest', 'pdb', 'traceback', 'warnings',
      'argparse', 'getopt', 'shutil', 'tempfile', 'glob', 'fnmatch', 'linecache', 'codecs',
      'hashlib', 'hmac', 'secrets', 'base64', 'zlib', 'gzip', 'bz2', 'lzma', 'zipfile',
      'tarfile', 'statistics', 'decimal', 'fractions', 'cmath', 'numbers', 'unicodedata',
      'locale', 'gettext', 'textwrap', 'difflib', 'readline', 'rlcompleter', 'struct',
      'codecs', 'mmap', 'select', 'selectors', 'signal', 'errno', 'ctypes', 'marshal',
      'dbm', 'shelve', 'sqlite3', 'zlib', 'gzip', 'bz2', 'lzma', 'zipfile', 'tarfile',
      'csv', 'configparser', 'netrc', 'xdrlib', 'plistlib', 'hashlib', 'hmac', 'secrets',
      'base64', 'binascii', 'queue', 'weakref', 'types', 'copy', 'pprint', 'reprlib',
      'enum', 'numbers', 'math', 'cmath', 'decimal', 'fractions', 'statistics', 'random',
      'secrets', 'statistics', 'itertools', 'functools', 'operator', 'pathlib', 'fileinput',
      'stat', 'filecmp', 'tempfile', 'glob', 'fnmatch', 'linecache', 'shutil', 'pickle',
      'copyreg', 'shelve', 'marshal', 'dbm', 'sqlite3', 'zlib', 'gzip', 'bz2', 'lzma',
      'zipfile', 'tarfile', 'csv', 'configparser', 'netrc', 'xdrlib', 'plistlib', 'hashlib',
      'hmac', 'secrets', 'base64', 'binascii', 'queue', 'weakref', 'types', 'copy', 'pprint',
      'reprlib', 'enum', 'numbers', 'math', 'cmath', 'decimal', 'fractions', 'statistics'
    ]
  }

  // Get module members (functions, attributes) for Python standard library modules
  const getPythonModuleMembers = (moduleName) => {
    const moduleMembers = {
      heapq: ['heappush', 'heappop', 'heapify', 'heappushpop', 'heapreplace', 'nlargest', 'nsmallest', 'merge'],
      collections: ['deque', 'defaultdict', 'OrderedDict', 'Counter', 'ChainMap', 'namedtuple', 'UserDict', 'UserList', 'UserString'],
      itertools: ['chain', 'combinations', 'combinations_with_replacement', 'compress', 'count', 'cycle', 'dropwhile', 'filterfalse', 'groupby', 'islice', 'permutations', 'product', 'repeat', 'starmap', 'takewhile', 'tee', 'zip_longest'],
      math: ['ceil', 'floor', 'sqrt', 'pow', 'exp', 'log', 'log10', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'degrees', 'radians', 'pi', 'e', 'tau', 'inf', 'nan', 'fabs', 'fmod', 'gcd', 'lcm', 'factorial', 'isqrt', 'copysign', 'fsum', 'prod'],
      random: ['random', 'randint', 'randrange', 'choice', 'choices', 'shuffle', 'sample', 'uniform', 'gauss', 'expovariate', 'seed'],
      string: ['ascii_letters', 'ascii_lowercase', 'ascii_uppercase', 'digits', 'hexdigits', 'octdigits', 'punctuation', 'whitespace', 'printable', 'capwords', 'Template'],
      re: ['match', 'search', 'findall', 'finditer', 'sub', 'subn', 'split', 'compile', 'escape', 'fullmatch'],
      json: ['loads', 'dumps', 'load', 'dump'],
      datetime: ['datetime', 'date', 'time', 'timedelta', 'timezone', 'now', 'today', 'utcnow', 'strptime', 'strftime'],
      time: ['time', 'sleep', 'gmtime', 'localtime', 'mktime', 'strftime', 'strptime', 'asctime', 'ctime'],
      os: ['getcwd', 'chdir', 'listdir', 'mkdir', 'makedirs', 'remove', 'rmdir', 'removedirs', 'rename', 'renames', 'path', 'environ', 'getenv', 'putenv', 'system'],
      sys: ['argv', 'exit', 'stdin', 'stdout', 'stderr', 'path', 'modules', 'version', 'platform'],
      pathlib: ['Path', 'PurePath', 'PurePosixPath', 'PureWindowsPath', 'PosixPath', 'WindowsPath'],
      functools: ['reduce', 'partial', 'lru_cache', 'cache', 'wraps', 'update_wrapper', 'cmp_to_key', 'total_ordering'],
      operator: ['add', 'sub', 'mul', 'truediv', 'floordiv', 'mod', 'pow', 'lt', 'le', 'eq', 'ne', 'ge', 'gt', 'not_', 'is_', 'is_not', 'and_', 'or_', 'xor', 'itemgetter', 'attrgetter', 'methodcaller'],
      bisect: ['bisect_left', 'bisect_right', 'bisect', 'insort_left', 'insort_right', 'insort'],
      array: ['array'],
      copy: ['copy', 'deepcopy'],
      enum: ['Enum', 'IntEnum', 'Flag', 'IntFlag', 'auto'],
      typing: ['List', 'Dict', 'Tuple', 'Set', 'Optional', 'Union', 'Any', 'Callable', 'TypeVar', 'Generic'],
      dataclasses: ['dataclass', 'field', 'fields', 'asdict', 'astuple', 'replace'],
      abc: ['ABC', 'abstractmethod', 'abstractproperty'],
      contextlib: ['contextmanager', 'closing', 'suppress', 'redirect_stdout', 'redirect_stderr', 'nullcontext'],
      io: ['open', 'StringIO', 'BytesIO'],
      pickle: ['dump', 'dumps', 'load', 'loads'],
      csv: ['reader', 'writer', 'DictReader', 'DictWriter'],
      xml: ['ElementTree', 'Element', 'parse'],
      html: ['escape', 'unescape'],
      urllib: ['request', 'parse', 'error', 'robotparser'],
      http: ['client', 'server', 'cookies'],
      socket: ['socket', 'AF_INET', 'SOCK_STREAM', 'gethostname', 'gethostbyname'],
      threading: ['Thread', 'Lock', 'RLock', 'Condition', 'Event', 'Semaphore', 'Timer'],
      multiprocessing: ['Process', 'Queue', 'Pipe', 'Pool', 'Manager', 'Value', 'Array'],
      asyncio: ['run', 'create_task', 'sleep', 'gather', 'wait', 'wait_for', 'as_completed', 'get_event_loop'],
      logging: ['getLogger', 'basicConfig', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
      unittest: ['TestCase', 'TestSuite', 'TestLoader', 'TextTestRunner', 'mock', 'assertEqual', 'assertTrue', 'assertFalse'],
      pdb: ['set_trace', 'post_mortem', 'pm', 'run', 'runeval', 'runcall'],
      traceback: ['print_exc', 'format_exc', 'print_stack', 'extract_tb', 'format_tb'],
      warnings: ['warn', 'filterwarnings', 'simplefilter'],
      argparse: ['ArgumentParser', 'Namespace'],
      getopt: ['getopt', 'gnu_getopt'],
      shutil: ['copy', 'copy2', 'copytree', 'move', 'rmtree', 'make_archive', 'unpack_archive'],
      tempfile: ['TemporaryFile', 'NamedTemporaryFile', 'TemporaryDirectory', 'mkdtemp', 'mkstemp', 'gettempdir', 'gettempdirb'],
      glob: ['glob', 'iglob', 'escape'],
      fnmatch: ['fnmatch', 'filter', 'translate'],
      linecache: ['getline', 'clearcache', 'checkcache'],
      codecs: ['encode', 'decode', 'lookup', 'open'],
      hashlib: ['md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'blake2b', 'blake2s', 'pbkdf2_hmac'],
      hmac: ['new', 'compare_digest'],
      secrets: ['token_bytes', 'token_hex', 'token_urlsafe', 'choice', 'randbelow', 'compare_digest'],
      base64: ['b64encode', 'b64decode', 'urlsafe_b64encode', 'urlsafe_b64decode', 'standard_b64encode', 'standard_b64decode'],
      zlib: ['compress', 'decompress', 'compressobj', 'decompressobj'],
      gzip: ['open', 'compress', 'decompress'],
      bz2: ['open', 'compress', 'decompress'],
      lzma: ['open', 'compress', 'decompress'],
      zipfile: ['ZipFile', 'is_zipfile'],
      tarfile: ['open', 'is_tarfile'],
      statistics: ['mean', 'median', 'mode', 'stdev', 'variance', 'pstdev', 'pvariance', 'quantiles'],
      decimal: ['Decimal', 'getcontext', 'setcontext', 'localcontext'],
      fractions: ['Fraction'],
      cmath: ['sqrt', 'exp', 'log', 'log10', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh', 'phase', 'polar', 'rect'],
      numbers: ['Number', 'Complex', 'Real', 'Rational', 'Integral'],
      unicodedata: ['name', 'lookup', 'category', 'bidirectional', 'combining', 'east_asian_width', 'mirrored', 'decomposition', 'normalize', 'decimal', 'digit', 'numeric'],
      locale: ['setlocale', 'getlocale', 'localeconv', 'str', 'format', 'currency', 'strcoll', 'strxfrm', 'getpreferredencoding'],
      gettext: ['translation', 'install', 'gettext', 'ngettext', 'dgettext', 'dngettext'],
      textwrap: ['wrap', 'fill', 'dedent', 'indent', 'shorten'],
      difflib: ['SequenceMatcher', 'Differ', 'unified_diff', 'context_diff', 'get_close_matches', 'ndiff'],
      readline: ['read_history_file', 'write_history_file', 'set_history_length', 'get_history_length', 'set_completer', 'get_completer', 'parse_and_bind', 'set_completion_display_matches_hook'],
      rlcompleter: ['Completer'],
      struct: ['pack', 'unpack', 'pack_into', 'unpack_from', 'calcsize', 'Struct'],
      mmap: ['mmap', 'ACCESS_READ', 'ACCESS_WRITE', 'ACCESS_COPY'],
      select: ['select', 'poll', 'epoll', 'kqueue', 'kevent', 'devpoll', 'PIPE_BUF'],
      selectors: ['DefaultSelector', 'SelectSelector', 'PollSelector', 'EpollSelector', 'KqueueSelector', 'EventSelector'],
      signal: ['signal', 'SIGINT', 'SIGTERM', 'SIGKILL', 'alarm', 'pause', 'setitimer', 'getitimer'],
      errno: ['errorcode', 'EACCES', 'EADDRINUSE', 'EADDRNOTAVAIL', 'EAFNOSUPPORT', 'EAGAIN', 'EALREADY', 'EBADF', 'EBADMSG', 'EBUSY', 'ECANCELED', 'ECHILD', 'ECONNABORTED', 'ECONNREFUSED', 'ECONNRESET', 'EDEADLK', 'EDESTADDRREQ', 'EDOM', 'EDQUOT', 'EEXIST', 'EFAULT', 'EFBIG', 'EHOSTUNREACH', 'EIDRM', 'EILSEQ', 'EINPROGRESS', 'EINTR', 'EINVAL', 'EIO', 'EISCONN', 'EISDIR', 'ELOOP', 'EMFILE', 'EMLINK', 'EMSGSIZE', 'ENAMETOOLONG', 'ENETDOWN', 'ENETRESET', 'ENETUNREACH', 'ENFILE', 'ENOBUFS', 'ENODEV', 'ENOENT', 'ENOEXEC', 'ENOLCK', 'ENOLINK', 'ENOMEM', 'ENOMSG', 'ENOPROTOOPT', 'ENOSPC', 'ENOSR', 'ENOSTR', 'ENOSYS', 'ENOTCONN', 'ENOTDIR', 'ENOTEMPTY', 'ENOTRECOVERABLE', 'ENOTSOCK', 'ENOTSUP', 'ENOTTY', 'ENXIO', 'EOPNOTSUPP', 'EOVERFLOW', 'EOWNERDEAD', 'EPERM', 'EPIPE', 'EPROTO', 'EPROTONOSUPPORT', 'EPROTOTYPE', 'ERANGE', 'EREMOTE', 'EROFS', 'ESPIPE', 'ESRCH', 'ESTALE', 'ETIME', 'ETIMEDOUT', 'ETXTBSY', 'EWOULDBLOCK', 'EXDEV'],
      ctypes: ['c_int', 'c_float', 'c_double', 'c_char', 'c_char_p', 'c_void_p', 'c_bool', 'c_long', 'c_longlong', 'c_short', 'c_ushort', 'c_uint', 'c_ulong', 'c_ulonglong', 'c_size_t', 'c_ssize_t', 'Structure', 'Union', 'Array', 'Pointer', 'byref', 'cast', 'POINTER', 'CFUNCTYPE', 'cdll', 'windll', 'oledll'],
      marshal: ['dump', 'load', 'dumps', 'loads', 'version'],
      dbm: ['open', 'whichdb'],
      shelve: ['open'],
      queue: ['Queue', 'LifoQueue', 'PriorityQueue', 'Empty', 'Full'],
      weakref: ['ref', 'proxy', 'WeakValueDictionary', 'WeakKeyDictionary', 'WeakSet', 'getweakrefcount', 'getweakrefs'],
      types: ['FunctionType', 'MethodType', 'BuiltinFunctionType', 'LambdaType', 'CodeType', 'FrameType', 'TracebackType', 'GeneratorType', 'CoroutineType', 'AsyncGeneratorType', 'ModuleType', 'SimpleNamespace', 'new_class', 'prepare_class', 'resolve_bases', 'get_original_bases', 'DynamicClassAttribute'],
      pprint: ['pprint', 'pformat', 'PrettyPrinter', 'isreadable', 'isrecursive', 'saferepr'],
      reprlib: ['repr', 'Repr', 'aRepr', 'recursive_repr']
    }
    
    return moduleMembers[moduleName] || []
  }

  // Get autocomplete suggestions
  const getAutocompleteSuggestions = (prefix, language, codeText) => {
    const suggestions = []
    
    // Get keywords
    const keywords = getLanguageKeywords(language)
    keywords.forEach(keyword => {
      if (keyword.toLowerCase().startsWith(prefix.toLowerCase()) && keyword.toLowerCase() !== prefix.toLowerCase()) {
        suggestions.push({ type: 'keyword', value: keyword, label: keyword })
      }
    })
    
    // Get defined symbols (variables, functions, imports)
    const symbols = extractCodeSymbols(codeText, language)
    
    // Variables
    symbols.variables.forEach(variable => {
      if (variable.toLowerCase().startsWith(prefix.toLowerCase()) && variable.toLowerCase() !== prefix.toLowerCase()) {
        suggestions.push({ type: 'variable', value: variable, label: variable })
      }
    })
    
    // Functions
    symbols.functions.forEach(func => {
      if (func.toLowerCase().startsWith(prefix.toLowerCase()) && func.toLowerCase() !== prefix.toLowerCase()) {
        suggestions.push({ type: 'function', value: func, label: func })
      }
    })
    
    // Already imported modules
    symbols.imports.forEach(module => {
      if (module.toLowerCase().startsWith(prefix.toLowerCase()) && module.toLowerCase() !== prefix.toLowerCase()) {
        suggestions.push({ type: 'module', value: module, label: module })
      }
    })
    
    // Standard library modules (Python only for now)
    if (language === 'python') {
      const stdlibModules = getPythonStandardModules()
      stdlibModules.forEach(module => {
        if (module.toLowerCase().startsWith(prefix.toLowerCase()) && 
            module.toLowerCase() !== prefix.toLowerCase() &&
            !symbols.imports.has(module)) {
          suggestions.push({ type: 'module', value: module, label: module, needsImport: true })
        }
      })
    }
    
    // Sort suggestions: keywords first, then variables, functions, modules
    const typeOrder = { keyword: 0, variable: 1, function: 2, module: 3 }
    suggestions.sort((a, b) => {
      const typeDiff = typeOrder[a.type] - typeOrder[b.type]
      if (typeDiff !== 0) return typeDiff
      return a.value.localeCompare(b.value)
    })
    
    return suggestions.slice(0, 20) // Limit to 20 suggestions
  }

  // Calculate cursor position for autocomplete dropdown
  const calculateAutocompletePosition = (textarea, wordStart) => {
    if (!textarea) return { top: 0, left: 0 }
    
    const textBeforeCursor = code.substring(0, wordStart)
    const lines = textBeforeCursor.split('\n')
    const currentLine = lines.length - 1
    const column = lines[currentLine].length
    
    // Get textarea position relative to its container
    const container = textarea.closest('[data-editor-container]')
    if (!container) return { top: 0, left: 0 }
    
    // Calculate character position using actual computed styles
    const computedStyle = getComputedStyle(textarea)
    const lineHeight = parseFloat(computedStyle.lineHeight) || 22.4
    const fontSize = parseFloat(computedStyle.fontSize) || 14
    // For monospace fonts, approximate character width as 60% of font size
    const charWidth = fontSize * 0.6
    const textareaPadding = 16 // Padding of the textarea
    
    // Calculate the top position of the NEXT line (below current line)
    // This ensures autocomplete always appears below the cursor line
    const currentLineTop = currentLine * lineHeight + textareaPadding - textarea.scrollTop
    const nextLineTop = currentLineTop + lineHeight
    const top = nextLineTop + 4 // Position below current line with small gap
    
    const left = column * charWidth - textarea.scrollLeft + textareaPadding // Account for padding
    
    // Check if dropdown would go off-screen to the right, if so, position to the left of cursor
    const containerRect = container.getBoundingClientRect()
    const estimatedDropdownWidth = 250 // Approximate dropdown width
    const rightEdge = left + estimatedDropdownWidth
    
    let finalLeft = left
    // If dropdown would overflow to the right, position it to the left of the cursor
    if (rightEdge > containerRect.width - 20) {
      // Position to the left, but ensure it doesn't go off the left edge
      finalLeft = Math.max(10, column * charWidth - textarea.scrollLeft - estimatedDropdownWidth + textareaPadding)
    }
    
    return { top, left: finalLeft }
  }

  // Check if a module needs to be imported and add import statement
  const addImportIfNeeded = (moduleName, language, codeText) => {
    if (language !== 'python') return codeText
    
    // Check if import already exists
    const lines = codeText.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('import ') && trimmed.includes(moduleName)) {
        return codeText // Already imported
      }
      if (trimmed.startsWith('from ') && trimmed.includes(moduleName)) {
        return codeText // Already imported
      }
    }
    
    // Find the first non-import line to insert import
    let insertIndex = 0
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('import ') && !trimmed.startsWith('from ')) {
        insertIndex = i
        break
      }
      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        insertIndex = i + 1
      }
    }
    
    // Insert import statement
    const importLine = `import ${moduleName}\n`
    const newLines = [...lines]
    newLines.splice(insertIndex, 0, importLine)
    return newLines.join('\n')
  }


  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAutocomplete) {
        const autocompleteElement = document.querySelector('[data-autocomplete]')
        const textarea = document.querySelector('textarea')
        if (autocompleteElement && !autocompleteElement.contains(e.target) && 
            textarea && !textarea.contains(e.target)) {
          setShowAutocomplete(false)
        }
      }
    }
    
    if (showAutocomplete) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showAutocomplete])

  // Track cursor position on focus to ensure it's always tracked
  useEffect(() => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return
    
    const handleFocus = () => {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      cursorPositionRef.current = { start, end }
      setCursorPosition({ start, end })
    }
    
    textarea.addEventListener('focus', handleFocus)
    return () => textarea.removeEventListener('focus', handleFocus)
  }, [code]) // Re-attach when code changes (textarea might be recreated)

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

      // Ctrl/Cmd + Arrow Right to go to next part (for multi-part questions)
      if (selectedProblem && (selectedProblem.IsMultiPart || selectedProblem.isMultiPart)) {
        const parts = selectedProblem.Parts || selectedProblem.parts || []
        if (parts.length > 0) {
          if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
            e.preventDefault()
            const maxPart = parts.length
            if (selectedPart < maxPart) {
              setSelectedPart(selectedPart + 1)
            }
            return
          }
          
          // Ctrl/Cmd + Arrow Left to go to previous part
          if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
            e.preventDefault()
            if (selectedPart > 0) {
              setSelectedPart(selectedPart - 1)
            }
            return
          }
        }
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
          // Handle multi-part questions
          const isMultiPart = selectedProblem && (selectedProblem.IsMultiPart || selectedProblem.isMultiPart)
          const parts = selectedProblem && (selectedProblem.Parts || selectedProblem.parts || [])
          if (isMultiPart && parts.length > 0) {
            if (selectedPart === 0) {
              if (selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
                setCode(partCodes[0] || selectedProblem.Stub[newLanguage])
              } else {
                setCode(partCodes[0] || getDefaultStubForLanguage(newLanguage))
              }
            } else {
              const part = parts[selectedPart - 1]
              const partStub = part.stub || part.Stub || {}
              if (partStub[newLanguage]) {
                setCode(partCodes[selectedPart] || partStub[newLanguage])
              } else {
                setCode(partCodes[selectedPart] || getDefaultStubForLanguage(newLanguage))
              }
            }
          } else {
          if (selectedProblem && selectedProblem.Stub && selectedProblem.Stub[newLanguage]) {
            setCode(selectedProblem.Stub[newLanguage])
          } else {
            setCode(getDefaultStubForLanguage(newLanguage))
            }
          }
        }
        return
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [selectedProblem, code, isRunning, isSubmittingCode, selectedLanguage, showShortcuts, isDarkMode, selectedPart])

  useEffect(() => {
    if (!selectedProblem) {
      setSelectedPart(0)
      setPartCodes({})
      setSubmittedParts({})
      return
    }

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

        // Reset part selection when problem changes
        setSelectedPart(0)
        setPartCodes({})
        setSubmittedParts({})

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

  // Handle part switching - load code for the selected part with carry-over from previous part
  useEffect(() => {
    if (!selectedProblem) return

    const isMultiPart = selectedProblem.IsMultiPart || selectedProblem.isMultiPart
    const parts = selectedProblem.Parts || selectedProblem.parts || []

    if (isMultiPart && parts.length > 0) {
      // Check if we already have code for this part
      if (partCodes[selectedPart] !== undefined && partCodes[selectedPart] !== '') {
        // Use existing code for this part
        setCode(partCodes[selectedPart])
      } else if (selectedPart > 0 && partCodes[selectedPart - 1] !== undefined && partCodes[selectedPart - 1] !== '') {
        // Carry over code from the previous part (for parts 2, 3, etc.)
        // This creates the dependency chain: part 2 builds on part 1, part 3 builds on part 2, etc.
        const previousCode = partCodes[selectedPart - 1]
        setCode(previousCode)
        // Also save this as the starting code for the current part
        setPartCodes(prev => ({
          ...prev,
          [selectedPart]: previousCode
        }))
      } else if (selectedPart === 0) {
        // Main part (Part 1) - use problem stub
        let stubCode = ''
        if (selectedProblem.Stub && selectedProblem.Stub[selectedLanguage]) {
          stubCode = selectedProblem.Stub[selectedLanguage]
        } else {
          stubCode = getDefaultStubForLanguage(selectedLanguage)
        }
        setCode(stubCode)
      } else {
        // Fallback for additional parts without previous code - use part stub
        const part = parts[selectedPart - 1]
        const partStub = part.stub || part.Stub || {}
        let stubCode = ''
        if (partStub[selectedLanguage]) {
          stubCode = partStub[selectedLanguage]
        } else {
          stubCode = getDefaultStubForLanguage(selectedLanguage)
        }
        setCode(stubCode)
      }
    }
  }, [selectedPart, selectedLanguage, selectedProblem])

  const submitCode = async () => {
    if (!selectedProblem) return
    
    setIsSubmittingCode(true)
    setResult(null)
    setError(null)

    const isMultiPart = selectedProblem.IsMultiPart || selectedProblem.isMultiPart
    const parts = selectedProblem.Parts || selectedProblem.parts || []
    const totalParts = parts.length + 1
    const isLastPart = selectedPart >= totalParts - 1

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
          Files: files,
          PartNumber: selectedPart // Include part number for multi-part questions
        })
      })

      const result = await response.json()
      setResult(result)

      // Mark this part as submitted
      setSubmittedParts(prev => ({
        ...prev,
        [selectedPart]: true
      }))

      if (result.verdict === 'Accepted') {
        if (isMultiPart && parts.length > 0) {
          if (isLastPart) {
            // All parts completed
            alert(`🎉 Congratulations! All ${totalParts} parts submitted successfully!`)
          } else {
            // Move to next part with code carry-over
            const currentCode = code
            const nextPart = selectedPart + 1
            
            // Save current code and pre-fill next part with current code
            setPartCodes(prev => ({
              ...prev,
              [selectedPart]: currentCode,
              [nextPart]: currentCode // Carry over code to the next part
            }))
            
            alert(`✓ Part ${selectedPart + 1} submitted! Moving to Part ${nextPart + 1}...`)
            
            // Move to next part
            setSelectedPart(nextPart)
          }
        } else {
        alert('Code submitted successfully!')
        }
      } else {
        if (isMultiPart && parts.length > 0) {
          alert(`Part ${selectedPart + 1} submission completed. Check the results for details.`)
      } else {
        alert('Submission completed. Check the results for details.')
        }
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

  // Navigate to homepage (clear selection and reset state)
  const goToHomepage = () => {
    setSelectedProblem(null)
    setCode('')
    setResult(null)
    setError(null)
    setJupyterCells([{ id: 1, code: '', output: '', isRunning: false, hasExecuted: false }])
    setIsJupyterMode(false)
    setIsFullscreen(false)
    window.history.pushState({}, '', window.location.pathname)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          <CeesarCodeLogo theme={theme} onClick={goToHomepage} />
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
              boxShadow: '0 2px 4px 0 rgba(37, 99, 235, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px 0 rgba(37, 99, 235, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.primary
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(37, 99, 235, 0.2)'
            }}
          >
            <IconPlus size={16} />
            <span>Create Problem</span>
          </button>
          <button
            onClick={() => setShowAgent(true)}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px 0 rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px 0 rgba(139, 92, 246, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(139, 92, 246, 0.3)'
            }}
          >
            <IconRobot size={16} />
            <span>AI Agent</span>
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
              <IconArrowLeft size={14} /> Back
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
              Forward <IconArrowRight size={14} />
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
              <IconRefresh size={14} /><span style={{ marginLeft: '4px' }}>Refresh</span>
            </button>
          </div>
          <button
            onClick={() => setIsAgentPanelOpen(!isAgentPanelOpen)}
            style={{
              backgroundColor: isAgentPanelOpen ? theme.primary : theme.surface,
              border: `1px solid ${isAgentPanelOpen ? theme.primary : theme.border}`,
              borderRadius: '6px',
              padding: '8px 12px',
              color: isAgentPanelOpen ? '#fff' : theme.text,
              cursor: 'pointer',
              fontSize: '12px',
              marginRight: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="AI Pair Programming & System Design"
          >
            <IconUsers size={16} />
            <span style={{ marginLeft: '6px' }}>Pair Programming</span>
            <span style={{
              backgroundColor: isAgentPanelOpen ? 'rgba(255,255,255,0.2)' : theme.primary,
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>AI</span>
          </button>
          <button
            onClick={toggleDarkMode}
            style={{
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '8px 14px',
              color: theme.text,
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.hover
              e.target.style.borderColor = theme.primary
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.surface
              e.target.style.borderColor = theme.border
            }}
          >
            {isDarkMode ? <><IconSun size={16} /><span>Light</span></> : <><IconMoon size={16} /><span>Dark</span></>}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '200px' }}>
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
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Question Type
                </label>
                <select
                  value={newProblem.type}
                  onChange={(e) => setNewProblem({...newProblem, type: e.target.value})}
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
                  <option value="coding">Coding Question</option>
                  <option value="system_design">System Design Question</option>
                </select>
              </div>

              {newProblem.type === 'system_design' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: theme.secondary,
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`
                }}>
                  <p style={{
                    margin: 0,
                    color: theme.textSecondary,
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    <IconLightbulb size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /><strong>Note:</strong> After creating this system design question, you'll be able to draw your architecture diagram in the main workspace using the Excalidraw canvas.
                  </p>
                </div>
              )}

              {newProblem.type === 'coding' && (
                <>
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      color: theme.text,
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={newProblem.isMultiPart}
                        onChange={(e) => {
                          const isMultiPart = e.target.checked
                          setNewProblem({
                            ...newProblem,
                            isMultiPart,
                            parts: isMultiPart && newProblem.parts.length === 0 
                              ? [{ partNumber: 2, statement: '', stub: {} }]
                              : newProblem.parts
                          })
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      Multi-part Question (with follow-ups)
                    </label>
                    {newProblem.isMultiPart && (
                      <div style={{
                        marginTop: '12px',
                        fontSize: '12px',
                        color: theme.textSecondary,
                        fontStyle: 'italic',
                        marginLeft: '24px'
                      }}>
                        Part 1 will be the main question above. Add follow-up parts that build on it.
              </div>
              )}
                  </div>

                  {newProblem.isMultiPart && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: theme.secondary,
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      marginTop: '16px'
                    }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                      Follow-up Parts ({newProblem.parts.length})
                    </label>
                    <button
                      onClick={() => {
                        const newPartNum = newProblem.parts.length + 2
                        setNewProblem({
                          ...newProblem,
                          parts: [...newProblem.parts, {
                            partNumber: newPartNum,
                            statement: '',
                            stub: {}
                          }]
                        })
                      }}
                      style={{
                        backgroundColor: theme.primary,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      + Add Part
                    </button>
                  </div>
                  {newProblem.parts.map((part, idx) => (
                    <div key={idx} style={{
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: theme.background,
                      borderRadius: '6px',
                      border: `1px solid ${theme.border}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ color: theme.text, fontSize: '13px', fontWeight: '600' }}>
                          Part {part.partNumber}
                        </label>
                        {newProblem.parts.length > 1 && (
                          <button
                            onClick={() => {
                              const updatedParts = newProblem.parts.filter((_, i) => i !== idx)
                                .map((p, i) => ({ ...p, partNumber: i + 2 }))
                              setNewProblem({ ...newProblem, parts: updatedParts })
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: theme.error || '#ff4444',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <textarea
                        value={part.statement}
                        onChange={(e) => {
                          const updatedParts = [...newProblem.parts]
                          updatedParts[idx].statement = e.target.value
                          setNewProblem({ ...newProblem, parts: updatedParts })
                        }}
                        placeholder={`Part ${part.partNumber} statement (builds on previous parts)...`}
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '8px',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '4px',
                          backgroundColor: theme.background,
                          color: theme.text,
                          fontSize: '13px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              </>
              )}

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
                    if (!newProblem.title.trim()) {
                      alert('Please fill in title')
                      return
                    }
                    if (!newProblem.isMultiPart && !newProblem.statement.trim()) {
                      alert('Please fill in statement')
                      return
                    }
                    if (newProblem.isMultiPart) {
                      if (newProblem.parts.length === 0) {
                        alert('Please add at least one follow-up part or uncheck multi-part')
                        return
                      }
                      for (let i = 0; i < newProblem.parts.length; i++) {
                        if (!newProblem.parts[i].statement.trim()) {
                          alert(`Please fill in statement for Part ${newProblem.parts[i].partNumber}`)
                          return
                        }
                      }
                    }

                    try {
                      // Prepare the request body
                      const requestBody = {
                        title: newProblem.title,
                        statement: newProblem.statement,
                        languages: newProblem.languages,
                        stub: newProblem.stub,
                        type: newProblem.type,
                        drawingData: newProblem.drawingData,
                        IsMultiPart: newProblem.isMultiPart,
                        Parts: newProblem.isMultiPart ? newProblem.parts.map(p => ({
                          partNumber: p.partNumber,
                          statement: p.statement,
                          stub: p.stub || {}
                        })) : []
                      }

                      const response = await fetch('/api/problems/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
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
                        stub: { python: '' },
                        type: 'coding',
                        drawingData: '',
                        isMultiPart: false,
                        parts: []
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
                  Question Type
                </label>
                <select
                  value={agentRequest.questionType}
                  onChange={(e) => setAgentRequest({...agentRequest, questionType: e.target.value})}
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
                  <option value="coding">Coding Questions</option>
                  <option value="system_design">System Design Questions</option>
                </select>
                <div style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: theme.textSecondary,
                  fontStyle: 'italic'
                }}>
                  {agentRequest.questionType === 'system_design' 
                    ? 'Generate system design interview questions with architecture diagrams'
                    : 'Generate coding interview questions with programming challenges'}
                </div>
              </div>

              {agentRequest.questionType === 'coding' && (
                <>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Default Programming Language
                </label>
                <select
                  value={agentRequest.defaultLanguage}
                  onChange={(e) => setAgentRequest({...agentRequest, defaultLanguage: e.target.value})}
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
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="c">C</option>
                  <option value="typescript">TypeScript</option>
                  <option value="ruby">Ruby</option>
                  <option value="swift">Swift</option>
                </select>
                <div style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: theme.textSecondary,
                  fontStyle: 'italic'
                }}>
                  Generated questions will prioritize this language
                </div>
              </div>

                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      color: theme.text,
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={agentRequest.includeMultiPart}
                        onChange={(e) => setAgentRequest({...agentRequest, includeMultiPart: e.target.checked})}
                        style={{ cursor: 'pointer' }}
                      />
                      Include Multi-part Questions
                    </label>
                    <div style={{
                      marginTop: '4px',
                      marginLeft: '24px',
                      fontSize: '12px',
                      color: theme.textSecondary,
                      fontStyle: 'italic'
                    }}>
                      Some generated questions will have follow-up parts that build on the initial problem
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  AI Provider
                </label>
                <select
                  value={agentRequest.provider}
                  onChange={(e) => setAgentRequest({...agentRequest, provider: e.target.value, apiKey: ''})}
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
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI (GPT-4o-mini)</option>
                  <option value="claude">Anthropic Claude</option>
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
                  API Key <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="password"
                  value={agentRequest.apiKey}
                  onChange={(e) => setAgentRequest({...agentRequest, apiKey: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${!agentRequest.apiKey ? '#EF4444' : theme.border}`,
                    borderRadius: '8px',
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = !agentRequest.apiKey ? '#EF4444' : theme.border}
                  placeholder={`Enter your ${agentRequest.provider === 'gemini' ? 'Gemini' : agentRequest.provider === 'openai' ? 'OpenAI' : 'Claude'} API key...`}
                />
                <p style={{
                  margin: '8px 0 0 0',
                  color: theme.textSecondary,
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  🔑 Required. Get your free key from{' '}
                  {agentRequest.provider === 'gemini' && <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>Google AI Studio</a>}
                  {agentRequest.provider === 'openai' && <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>OpenAI Platform</a>}
                  {agentRequest.provider === 'claude' && <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>Anthropic Console</a>}
                </p>
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

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Interview Type / Description (Optional)
                </label>
                <textarea
                  value={agentRequest.interviewType}
                  onChange={(e) => setAgentRequest({...agentRequest, interviewType: e.target.value})}
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
                  placeholder="Describe the interview type or format (e.g., 'Technical phone screen focusing on algorithms', 'On-site system design interview', 'Take-home assignment style', 'Live coding with pair programming', etc.)..."
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
                <IconRefresh size={14} /><span style={{ marginLeft: '4px' }}>Reset</span>
              </button>
              <button
                onClick={generateQuestions}
                disabled={isGeneratingQuestions || !agentRequest.company || (useCustomRole ? !agentRequest.customRole : !agentRequest.role)}
                style={{
                  flex: 1,
                  backgroundColor: isGeneratingQuestions || !agentRequest.company || (useCustomRole ? !agentRequest.customRole : !agentRequest.role) ? theme.border : theme.accent,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '14px',
                  cursor: isGeneratingQuestions || !agentRequest.company || (useCustomRole ? !agentRequest.customRole : !agentRequest.role) ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  opacity: isGeneratingQuestions || !agentRequest.company || (useCustomRole ? !agentRequest.customRole : !agentRequest.role) ? 0.6 : 1
                }}
              >
                {isGeneratingQuestions ? 'Generating...' : <><IconZap size={14} style={{ marginRight: '6px' }} />Generate Questions</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden',
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
              maxWidth: '600px',
              height: '100%'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              position: 'sticky',
              top: '-20px',
              zIndex: 2,
              backgroundColor: theme.background,
              paddingTop: '4px',
              paddingBottom: '4px'
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
                    <IconChevronLeft size={16} />
                  </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={async () => {
                    if (!window.confirm('This will remove ALL questions, including default and sample questions. Are you sure?')) {
                      return
                    }
                    
                    setIsLoadingProblems(true)
                    try {
                      const response = await fetch('/api/problems/clear', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      })
                      
                      if (!response.ok) {
                        const errorText = await response.text()
                        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to clear all problems'}`)
                      }
                      
                      const result = await response.json()
                      alert(result.message || `Cleared ${result.count || 0} problems`)
                      
                      // Refresh the problems list (should be empty now)
                      const refreshResponse = await fetch('/api/problems')
                      if (refreshResponse.ok) {
                        const data = await refreshResponse.json()
                      setProblems(data || [])
                        setSelectedProblem(null)
                      }
                    } catch (err) {
                      console.error('Error clearing all problems:', err)
                      alert('Failed to clear all problems: ' + (err.message || 'Unknown error'))
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
                  <IconTrash size={14} /><span style={{ marginLeft: '4px' }}>Clear All</span>
                </button>
                <button
                  onClick={async () => {
                    if (isLoadingProblems) return // Prevent multiple clicks
                    if (!window.confirm('This will remove all AI-generated problems. Are you sure?')) {
                      return
                    }
                    
                    setIsLoadingProblems(true)
                    try {
                      const response = await fetch('/api/agent/clean', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      })
                      
                      if (!response.ok) {
                        const errorText = await response.text()
                        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to clean AI problems'}`)
                      }
                      
                      const result = await response.json()
                      alert(result.message || `Cleaned ${result.count || 0} AI-generated problems`)
                      
                      // Refresh the problems list
                      const refreshResponse = await fetch('/api/problems')
                      if (refreshResponse.ok) {
                        const data = await refreshResponse.json()
                        setProblems(data || [])
                        // Clear selected problem if it was AI-generated and was deleted
                        if (selectedProblem) {
                          const stillExists = data.some(p => (p.ID || p.id) === (selectedProblem.ID || selectedProblem.id))
                          if (!stillExists) {
                            setSelectedProblem(null)
                            setResult(null)
                            setError(null)
                          }
                        }
                      }
                    } catch (err) {
                      console.error('Error cleaning AI problems:', err)
                      alert('Failed to clean AI problems: ' + (err.message || 'Unknown error'))
                    } finally {
                      setIsLoadingProblems(false)
                    }
                  }}
                  disabled={isLoadingProblems}
                  style={{
                    backgroundColor: theme.error,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: isLoadingProblems ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: isLoadingProblems ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoadingProblems) {
                      e.target.style.opacity = '0.9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoadingProblems) {
                      e.target.style.opacity = '1'
                    }
                  }}
                >
                  <IconSparkles size={14} /><span style={{ marginLeft: '4px' }}>Clean AI</span>
                </button>
              </div>
            </div>
            
            {/* Search and Sort Controls */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '12px',
              padding: '0 4px'
            }}>
              {/* Search Input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search problems..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.surface,
                    color: theme.text,
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.primary}
                  onBlur={(e) => e.target.style.borderColor = theme.border}
                />
                <span style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.textSecondary,
                  fontSize: '14px',
                  pointerEvents: 'none'
                }}><IconSearch size={14} /></span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: theme.textSecondary,
                      cursor: 'pointer',
                      padding: '2px 6px',
                      fontSize: '12px',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.color = theme.text}
                    onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
                    title="Clear search"
                  ><IconX size={14} /></button>
                )}
              </div>
              
              {/* Sort Controls */}
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    backgroundColor: theme.surface,
                    color: theme.text,
                    fontSize: '12px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="none">Sort by...</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
                
                {sortField !== 'none' && (
                  <button
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    style={{
                      padding: '6px 10px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      backgroundColor: theme.surface,
                      color: theme.text,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.border}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.surface}
                    title={sortDirection === 'asc' ? 'Ascending (A-Z)' : 'Descending (Z-A)'}
                  >
                    {sortDirection === 'asc' ? '↑ A-Z' : '↓ Z-A'}
                  </button>
                )}
                
                {(searchQuery || sortField !== 'none') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSortField('none')
                      setSortDirection('asc')
                    }}
                    style={{
                      padding: '6px 8px',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      color: theme.textSecondary,
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.surface
                      e.target.style.color = theme.text
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = theme.textSecondary
                    }}
                    title="Clear all filters"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              {/* Results count */}
              {(searchQuery || sortField !== 'none') && (
                <div style={{
                  fontSize: '11px',
                  color: theme.textSecondary,
                  paddingLeft: '4px'
                }}>
                  {filteredAndSortedProblems.length} of {problems.length} problems
                  {searchQuery && ` matching "${searchQuery}"`}
                  {sortField !== 'none' && ` • Sorted by ${sortField}`}
                </div>
              )}
            </div>
            
            {isLoadingProblems ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <LoadingSpinner theme={theme} />
                <p style={{ margin: '12px 0 0 0', color: theme.textSecondary }}>
                  Loading problems...
                </p>
              </div>
            ) : filteredAndSortedProblems.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 20px',
                color: theme.textSecondary
              }}>
                {searchQuery ? (
                  <>
                    <div style={{ marginBottom: '12px' }}><IconSearch size={32} /></div>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      No problems found matching "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        marginTop: '12px',
                        padding: '6px 12px',
                        backgroundColor: theme.primary,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '12px', color: theme.textSecondary }}><IconFileText size={40} /></div>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      No problems available
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div>
                {filteredAndSortedProblems.map(problem => {
                  // Handle both uppercase and lowercase field names
                  const problemID = problem.ID || problem.id
                  const problemTitle = problem.Title || problem.title
                  const problemLanguages = problem.Languages || problem.languages || []
                  const problemType = problem.Type || problem.type || 'coding'
                  
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px'
                      }}>
                        <div style={{ 
                          fontWeight: '600',
                          fontSize: '15px',
                          lineHeight: '1.4',
                          flex: 1
                        }}>
                          {problemTitle}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {problemType === 'system_design' && (
                          <span style={{
                            backgroundColor: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                              ? 'rgba(255,255,255,0.2)'
                              : theme.primary,
                            color: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                              ? '#FFFFFF'
                              : '#FFFFFF',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            System Design
                          </span>
                        )}
                          {(problem.IsMultiPart || problem.isMultiPart) && (problem.Parts || problem.parts) && (problem.Parts || problem.parts).length > 0 && (
                            <span style={{
                              backgroundColor: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                                ? 'rgba(255,255,255,0.2)'
                                : theme.accent,
                              color: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                                ? '#FFFFFF'
                                : '#FFFFFF',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Multi-Part ({(problem.Parts || problem.parts).length + 1})
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm(`Are you sure you want to delete "${problemTitle}"?`)) {
                              deleteProblem(problemID)
                            }
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                              ? 'rgba(255,255,255,0.7)'
                              : theme.error,
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = selectedProblem && (selectedProblem.ID || selectedProblem.id) === problemID
                              ? 'rgba(255,255,255,0.1)'
                              : 'rgba(239, 68, 68, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent'
                          }}
                          title="Delete problem"
                        >
                          <IconTrash size={14} />
                        </button>
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

        <main style={{
          padding: '0',
          overflow: 'hidden',
          backgroundColor: theme.background,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: 0
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
              flex: 1,
              minHeight: 0,
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                backgroundColor: theme.background,
                borderBottom: `1px solid ${theme.border}`,
                flexShrink: 0
              }}>
                <h2 style={{
                  margin: '0',
                  color: theme.text,
                  fontSize: '18px',
                  fontWeight: '600',
                  letterSpacing: '-0.3px',
                  lineHeight: '1.4'
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
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    {isJupyterMode ? <><IconMonitor size={14} /><span style={{ marginLeft: '4px' }}>IDE Mode</span></> : <><IconBook size={14} /><span style={{ marginLeft: '4px' }}>Jupyter Mode</span></>}
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
                      borderRadius: '4px',
                      padding: '4px 10px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    <IconArrowLeft size={14} /><span style={{ marginLeft: '4px' }}>Back</span>
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
                <div
                  ref={problemHeaderRef}
                  style={{
                    padding: '8px 16px',
                    paddingLeft: sidebarCollapsed ? '32px' : '16px',
                    borderBottom: `1px solid ${theme.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                    flexShrink: 0,
                    position: 'relative'
                }}>
                  {sidebarCollapsed && (
                    <button
                      onClick={toggleSidebar}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: theme.primary,
                        color: '#FFFFFF',
                        border: 'none',
                        borderTopRightRadius: '6px',
                        borderBottomRightRadius: '6px',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s ease',
                        fontSize: '11px',
                        lineHeight: 1,
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      <IconPlay size={14} />
                    </button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <h4 style={{
                    margin: 0,
                    color: theme.text,
                        fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    Problem Statement
                  </h4>
                    {(selectedProblem.IsMultiPart || selectedProblem.isMultiPart) && (selectedProblem.Parts || selectedProblem.parts) && (selectedProblem.Parts || selectedProblem.parts).length > 0 && (() => {
                      const parts = selectedProblem.Parts || selectedProblem.parts || []
                      const totalParts = parts.length + 1
                      const maxPart = parts.length
                      return (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {/* Previous Part Button */}
                          <button
                            onClick={() => {
                              if (selectedPart > 0) {
                                setSelectedPart(selectedPart - 1)
                              }
                            }}
                            disabled={selectedPart === 0}
                            style={{
                              padding: '4px 6px',
                              fontSize: '11px',
                              backgroundColor: 'transparent',
                              color: selectedPart === 0 ? theme.textSecondary : theme.text,
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              cursor: selectedPart === 0 ? 'not-allowed' : 'pointer',
                              opacity: selectedPart === 0 ? 0.5 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '24px'
                            }}
                            title="Previous Part (Ctrl/Cmd + Left Arrow)"
                          >
                            <IconChevronLeft size={14} />
                          </button>
                          
                          {/* Part Buttons */}
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button
                              onClick={() => setSelectedPart(0)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: submittedParts[0] ? theme.success : (selectedPart === 0 ? theme.primary : theme.surface),
                                color: submittedParts[0] || selectedPart === 0 ? '#FFFFFF' : theme.text,
                                border: `1px solid ${submittedParts[0] ? theme.success : (selectedPart === 0 ? theme.primary : theme.border)}`,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: selectedPart === 0 ? '600' : '400',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {submittedParts[0] ? '✓ ' : ''}Part 1
                            </button>
                            {parts.map((part, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedPart(idx + 1)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  backgroundColor: submittedParts[idx + 1] ? theme.success : (selectedPart === idx + 1 ? theme.primary : theme.surface),
                                  color: submittedParts[idx + 1] || selectedPart === idx + 1 ? '#FFFFFF' : theme.text,
                                  border: `1px solid ${submittedParts[idx + 1] ? theme.success : (selectedPart === idx + 1 ? theme.primary : theme.border)}`,
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: selectedPart === idx + 1 ? '600' : '400',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {submittedParts[idx + 1] ? '✓ ' : ''}Part {part.partNumber}
                              </button>
                            ))}
                          </div>
                          
                          {/* Next Part Button */}
                          <button
                            onClick={() => {
                              if (selectedPart < maxPart) {
                                setSelectedPart(selectedPart + 1)
                              }
                            }}
                            disabled={selectedPart >= maxPart}
                            style={{
                              padding: '4px 6px',
                              fontSize: '11px',
                              backgroundColor: 'transparent',
                              color: selectedPart >= maxPart ? theme.textSecondary : theme.text,
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              cursor: selectedPart >= maxPart ? 'not-allowed' : 'pointer',
                              opacity: selectedPart >= maxPart ? 0.5 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '24px'
                            }}
                            title="Next Part (Ctrl/Cmd + Right Arrow)"
                          >
                            <IconChevronRight size={14} />
                          </button>
                          
                          {/* Part Indicator */}
                          <span style={{
                            fontSize: '11px',
                            color: theme.textSecondary,
                            marginLeft: '4px',
                            fontWeight: '500'
                          }}>
                            ({selectedPart + 1}/{totalParts})
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </div>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
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
                  {(() => {
                    const isMultiPart = selectedProblem.IsMultiPart || selectedProblem.isMultiPart
                    const parts = selectedProblem.Parts || selectedProblem.parts || []
                    if (isMultiPart && parts.length > 0) {
                      if (selectedPart === 0) {
                        return selectedProblem.Statement
                      } else {
                        const part = parts[selectedPart - 1]
                        return part.statement || part.Statement || ''
                      }
                    }
                    return selectedProblem.Statement
                  })()}
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

                {/* Right Panel: Code Editor or System Design Canvas */}
                {selectedProblem && (selectedProblem.Type === 'system_design' || selectedProblem.type === 'system_design') ? (
                  <div style={{
                    width: isFullscreen ? '100vw' : `${100 - leftPaneWidth}%`,
                    height: isFullscreen ? '100vh' : 'auto',
                    position: isFullscreen ? 'fixed' : 'relative',
                    top: isFullscreen ? 0 : 'auto',
                    left: isFullscreen ? 0 : 'auto',
                    zIndex: isFullscreen ? 9999 : 'auto',
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
                      flexShrink: 0,
                      backgroundColor: theme.surface
                    }}>
                      <h4 style={{
                        margin: 0,
                        color: theme.text,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        System Design Canvas
                      </h4>
                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: theme.primary,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = theme.accent}
                        onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                      >
                        {isFullscreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}
                      </button>
                    </div>
                    <div style={{
                      flex: 1,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <ExcalidrawErrorBoundary theme={theme}>
                        <Suspense fallback={
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: theme.textSecondary,
                            fontSize: '14px'
                          }}>
                            Loading design canvas...
                          </div>
                        }>
                          <Excalidraw
                            onChange={handleExcalidrawChange}
                            initialData={(() => {
                              try {
                                if (selectedProblem.DrawingData) {
                                  const parsed = JSON.parse(selectedProblem.DrawingData)
                                  // Ensure appState has required structure
                                  if (parsed.appState && !parsed.appState.collaborators) {
                                    parsed.appState.collaborators = new Map()
                                  }
                                  return parsed
                                }
                                // Return default structure with collaborators
                                return {
                                  elements: [],
                                  appState: { collaborators: new Map() },
                                  files: {}
                                }
                              } catch (err) {
                                console.error('Failed to parse drawing data:', err)
                                return {
                                  elements: [],
                                  appState: { collaborators: new Map() },
                                  files: {}
                                }
                              }
                            })()}
                            theme={isDarkMode ? 'dark' : 'light'}
                          />
                        </Suspense>
                      </ExcalidrawErrorBoundary>
                    </div>
                  </div>
                ) : !isJupyterMode ? (
                <div style={{
                    width: `${100 - leftPaneWidth}%`,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.background,
                    overflow: 'hidden',
                    minWidth: '300px'
                }}>
                  <div style={{
                      padding: '8px 16px',
                      borderBottom: `1px solid ${theme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                      flexShrink: 0
                  }}>
                    <h4 style={{
                      margin: 0,
                      color: theme.text,
                        fontSize: '13px',
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
                          {isRunning ? 'Running...' : <><IconPlay size={14} /><span style={{ marginLeft: '4px' }}>Run</span></>}
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
                          {(() => {
                            if (isSubmittingCode) return 'Submitting...'
                            
                            const isMultiPart = selectedProblem && (selectedProblem.IsMultiPart || selectedProblem.isMultiPart)
                            const parts = selectedProblem && (selectedProblem.Parts || selectedProblem.parts || [])
                            
                            if (isMultiPart && parts.length > 0) {
                              const totalParts = parts.length + 1
                              const isLastPart = selectedPart >= totalParts - 1
                              const isPartSubmitted = submittedParts[selectedPart]
                              
                              if (isPartSubmitted) {
                                return <><span>✓</span>Part {selectedPart + 1} Submitted</>
                              } else if (isLastPart) {
                                return <><span>✓</span>Submit Final Part</>
                              } else {
                                return <><IconArrowRight size={14} /><span style={{ marginLeft: '4px' }}>Submit Part {selectedPart + 1} & Continue</span></>
                              }
                            }
                            
                            return <><span>✓</span>Submit</>
                          })()}
                      </button>
                    </div>
                  </div>
                    <div data-editor-container style={{ 
                      position: 'relative', 
                      flex: 1, 
                      minHeight: 0,
                      overflow: 'hidden',
                      backgroundColor: theme.codeBackground
                    }}>
                      <Editor
                        height="100%"
                        language={getMonacoLanguage(selectedLanguage)}
                        value={code}
                        onChange={(value) => handleCodeChange(value || '')}
                        theme={isDarkMode ? 'vs-dark' : 'light'}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: 'on',
                          wrappingIndent: 'indent',
                            fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Liberation Mono", "Courier New", monospace',
                          lineHeight: 24,
                          padding: { top: 16, bottom: 16 },
                          scrollbar: {
                            vertical: 'auto',
                            horizontal: 'auto',
                            useShadows: false,
                            verticalHasArrows: false,
                            horizontalHasArrows: false
                          },
                          readOnly: false,
                          cursorBlinking: 'blink',
                          cursorSmoothCaretAnimation: 'on',
                          smoothScrolling: true,
                          renderWhitespace: 'selection',
                          renderLineHighlight: 'all',
                          selectOnLineNumbers: true,
                          roundedSelection: false,
                          contextmenu: true,
                          mouseWheelZoom: false,
                          quickSuggestions: true,
                          suggestOnTriggerCharacters: true,
                          acceptSuggestionOnEnter: 'on',
                          tabCompletion: 'on',
                          wordBasedSuggestions: 'matchingDocuments',
                          formatOnPaste: false,
                          formatOnType: false
                        }}
                        onMount={(editor, monaco) => {
                          // Add custom keyboard shortcuts
                          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                            if (selectedProblem && code.trim() && !isRunning) {
                              runCode()
                            }
                          })
                          
                          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
                            if (selectedProblem) {
                              clearCode()
                            }
                          })
                        }}
                      />
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
                          overflow: 'hidden',
                          padding: '0'
                        }}>
                          <TerminalComponent
                            output={result ? (
                              result.result && result.result.trim() !== '' ? result.result :
                              result.error && result.error.trim() !== '' ? `\x1b[31mError: ${result.error}\x1b[0m` :
                              result.compile_log && result.compile_log.trim() !== '' ? `\x1b[31m${result.compile_log}\x1b[0m` :
                              '(No output)'
                            ) : null}
                            theme={theme}
                            isDarkMode={isDarkMode}
                            version={consoleVersion}
                          />
                                </div>
                                </div>
                              )}
                            </div>
                          ) : (
                /* JupyterLite ML Notebook Mode */
                <div style={{
                    width: `${100 - leftPaneWidth}%`,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.background,
                    overflow: 'hidden',
                    minWidth: '300px'
                }}>
                  <JupyterLiteNotebook isDarkMode={isDarkMode} theme={theme} />
                            </div>
                          )}
              
              {/* Legacy Jupyter UI - Hidden but kept for backwards compatibility */}
              {false && (
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
                      Legacy Jupyter Notebook
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
                          {isRunning ? 'Running...' : <><IconPlay size={14} /><span style={{ marginLeft: '4px' }}>Run All</span></>}
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
            <div style={{ textAlign: 'center', padding: '40px', position: 'relative' }}>
              {sidebarCollapsed && (
                <button
                  onClick={toggleSidebar}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '20px',
                    backgroundColor: theme.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderTopRightRadius: '6px',
                    borderBottomRightRadius: '6px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                  title="Expand sidebar"
                >
                  <IconChevronRight size={16} />
                </button>
              )}
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
      
      {/* AI Agent Panel - Pair Programming & System Design */}
      {isAgentPanelOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: 0,
          width: '400px',
          height: 'calc(100vh - 60px)',
          backgroundColor: theme.background,
          borderLeft: `1px solid ${theme.border}`,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
        }}>
          <AgentPanel
            isOpen={isAgentPanelOpen}
            onClose={() => setIsAgentPanelOpen(false)}
            problemContext={selectedProblem ? (selectedProblem.Statement || selectedProblem.statement) : ''}
            codeContext={code}
            language={selectedLanguage}
            theme={theme}
            isDarkMode={isDarkMode}
            onInsertCode={(newCode) => {
              // Insert code at cursor or append
              setCode(prevCode => prevCode + '\n' + newCode)
            }}
          />
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

// Wrap the app in error boundary
export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  )
}
