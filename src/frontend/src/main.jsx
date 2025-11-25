import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Simple entry point - no Chakra UI wrapper to maintain compatibility
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
