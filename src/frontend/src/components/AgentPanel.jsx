import React, { useState, useRef, useEffect } from 'react'

// SVG Icon components to replace emojis
const IconRobot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
)

const IconCode = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16,18 22,12 16,6"/>
    <polyline points="8,6 2,12 8,18"/>
  </svg>
)

const IconLayers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 2,7 12,12 22,7 12,2"/>
    <polyline points="2,17 12,22 22,17"/>
    <polyline points="2,12 12,17 22,12"/>
  </svg>
)

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
  </svg>
)

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
)

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

// Standalone Agent Panel component - no external UI library dependencies
export const AgentPanel = ({ 
  isOpen, 
  onClose, 
  problemContext,
  codeContext,
  language,
  onInsertCode,
  theme,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState('pair')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState('coding')
  const messagesEndRef = useRef(null)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const endpoint = activeTab === 'pair' 
        ? '/api/v1/agent/pair-programming' 
        : '/api/v1/agent/system-design'
      
      const requestBody = activeTab === 'pair' 
        ? {
            mode,
            problemContext: problemContext || '',
            codeContext: codeContext || '',
            language: language || 'python',
            history: messages,
            query: input,
          }
        : {
            mode: mode === 'coding' ? 'brainstorm' : mode,
            problemContext: problemContext || '',
            history: messages,
            query: input,
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.status === 'success' && data.messages) {
        setMessages(prev => [...prev, ...data.messages])
      } else if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      }
    } catch (error) {
      console.error('Agent request failed:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please check your connection and try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Parse and render content with code blocks
  const renderContent = (content, msgIndex) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n?([\s\S]*?)```/)
        if (match) {
          const [, lang, code] = match
          const codeIndex = `${msgIndex}-${index}`
          return (
            <div key={index} style={{ margin: '8px 0' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
                padding: '4px 12px',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                fontSize: '12px'
              }}>
                <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{lang || 'code'}</span>
                <button
                  onClick={() => handleCopyCode(code.trim(), codeIndex)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    padding: '2px 6px',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedIndex === codeIndex ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
                </button>
              </div>
              <pre style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
                padding: '12px',
                borderBottomLeftRadius: '6px',
                borderBottomRightRadius: '6px',
                overflow: 'auto',
                maxHeight: '300px',
                fontSize: '13px',
                fontFamily: '"SF Mono", Monaco, Consolas, monospace',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                <code>{code.trim()}</code>
              </pre>
            </div>
          )
        }
      }
      return part ? <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span> : null
    })
  }

  if (!isOpen) return null

  const pairModes = ['coding', 'review', 'debug', 'explain']
  const designModes = ['brainstorm', 'review', 'deep-dive', 'tradeoffs']
  const currentModes = activeTab === 'pair' ? pairModes : designModes

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: theme?.background || (isDarkMode ? '#111827' : '#ffffff'),
      color: theme?.text || (isDarkMode ? '#f9fafb' : '#111827')
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: `1px solid ${theme?.border || (isDarkMode ? '#374151' : '#e5e7eb')}`,
        background: isDarkMode ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' : 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <IconRobot />
          </div>
          <div>
            <span style={{ fontWeight: '600', fontSize: '14px', display: 'block' }}>AI Assistant</span>
            <span style={{
              fontSize: '10px',
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Pair Programming</span>
          </div>
          <span style={{
            backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)',
            color: isDarkMode ? '#c4b5fd' : '#7c3aed',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            border: `1px solid ${isDarkMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'}`
          }}>BETA</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme?.text || (isDarkMode ? '#9ca3af' : '#6b7280'),
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = isDarkMode ? '#374151' : '#e5e7eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <IconX />
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${theme?.border || (isDarkMode ? '#374151' : '#e5e7eb')}`,
        padding: '0 16px',
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb'
      }}>
        <button
          onClick={() => { setActiveTab('pair'); setMode('coding'); }}
          style={{
            padding: '12px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'pair' ? (theme?.primary || '#3b82f6') : (theme?.textSecondary || '#6b7280'),
            borderBottom: activeTab === 'pair' ? `2px solid ${theme?.primary || '#3b82f6'}` : '2px solid transparent',
            fontWeight: activeTab === 'pair' ? '600' : '400',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <IconCode /> Pair Programming
        </button>
        <button
          onClick={() => { setActiveTab('design'); setMode('brainstorm'); }}
          style={{
            padding: '12px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'design' ? (theme?.primary || '#3b82f6') : (theme?.textSecondary || '#6b7280'),
            borderBottom: activeTab === 'design' ? `2px solid ${theme?.primary || '#3b82f6'}` : '2px solid transparent',
            fontWeight: activeTab === 'design' ? '600' : '400',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <IconLayers /> System Design
        </button>
      </div>

      {/* Mode selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        borderBottom: `1px solid ${theme?.border || (isDarkMode ? '#374151' : '#e5e7eb')}`,
        flexWrap: 'wrap',
        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(249, 250, 251, 0.5)'
      }}>
        {currentModes.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '6px 12px',
              border: mode === m ? 'none' : `1px solid ${theme?.border || (isDarkMode ? '#374151' : '#d1d5db')}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: mode === m ? (theme?.primary || '#3b82f6') : 'transparent',
              color: mode === m ? '#fff' : (theme?.text || (isDarkMode ? '#d1d5db' : '#374151')),
              transition: 'all 0.2s'
            }}
          >
            {m.charAt(0).toUpperCase() + m.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {messages.length === 0 && (
          <div style={{
            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '10px', 
              color: isDarkMode ? '#93c5fd' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <IconInfo />
              {activeTab === 'pair' ? 'Pair Programming Tips' : 'System Design Tips'}
            </div>
            <div style={{ fontSize: '13px', color: isDarkMode ? '#bfdbfe' : '#1e40af', lineHeight: '1.6' }}>
              {activeTab === 'pair' ? (
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Be specific about what you want help with</li>
                  <li>Share relevant context and constraints</li>
                  <li>Review all suggestions critically before using</li>
                  <li>The AI suggests, you decide what to apply</li>
                </ul>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Start with requirements and constraints</li>
                  <li>Think about scale and performance</li>
                  <li>Consider trade-offs between approaches</li>
                  <li>Break down complex systems into components</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}
          >
            <div style={{
              maxWidth: '90%',
              backgroundColor: msg.role === 'user' 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : (isDarkMode ? '#374151' : '#f3f4f6'),
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : (isDarkMode ? '#374151' : '#f3f4f6'),
              color: msg.role === 'user' ? '#fff' : (theme?.text || (isDarkMode ? '#f9fafb' : '#111827')),
              padding: '12px 16px',
              borderRadius: '12px',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
              borderBottomLeftRadius: msg.role === 'user' ? '12px' : '4px',
              fontSize: '14px',
              lineHeight: '1.6',
              boxShadow: msg.role === 'user' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
            }}>
              {renderContent(msg.content, idx)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
              padding: '12px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="loading-dots" style={{ display: 'flex', gap: '4px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: theme?.primary || '#3b82f6',
                  borderRadius: '50%',
                  animation: 'pulse 1.4s infinite',
                  animationDelay: '0s'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: theme?.primary || '#3b82f6',
                  borderRadius: '50%',
                  animation: 'pulse 1.4s infinite',
                  animationDelay: '0.2s'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: theme?.primary || '#3b82f6',
                  borderRadius: '50%',
                  animation: 'pulse 1.4s infinite',
                  animationDelay: '0.4s'
                }}></span>
              </span>
              <span style={{ fontSize: '13px', color: theme?.textSecondary || '#6b7280' }}>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: `1px solid ${theme?.border || (isDarkMode ? '#374151' : '#e5e7eb')}`,
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            placeholder={activeTab === 'pair' ? "Ask for help with your code..." : "Describe your system design challenge..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            style={{
              flex: 1,
              padding: '12px',
              border: `1px solid ${theme?.border || (isDarkMode ? '#374151' : '#d1d5db')}`,
              borderRadius: '8px',
              backgroundColor: isDarkMode ? '#111827' : '#fff',
              color: theme?.text || (isDarkMode ? '#f9fafb' : '#111827'),
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme?.primary || '#3b82f6'
              e.target.style.boxShadow = `0 0 0 3px ${isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme?.border || (isDarkMode ? '#374151' : '#d1d5db')
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 16px',
              background: isLoading || !input.trim() 
                ? (isDarkMode ? '#374151' : '#d1d5db')
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isLoading || !input.trim() ? 'none' : '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
          >
            <IconSend />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default AgentPanel
