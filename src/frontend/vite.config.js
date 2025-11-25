import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determine API base URL based on environment
  const getApiBaseUrl = () => {
    const viteEnv = env.VITE_ENV || 'dev'
    
    if (viteEnv === 'gamma') {
      return env.VITE_API_BASE_URL || 'http://localhost:8080'
    }
    if (viteEnv === 'prod') {
      return env.VITE_API_BASE_URL || ''
    }
    // Development - proxy through Vite
    return ''
  }

  return {
    plugins: [react()],
    define: {
      // Make environment variables available in the app
      'import.meta.env.VITE_ENV': JSON.stringify(env.VITE_ENV || 'dev'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(getApiBaseUrl()),
    },
    server: {
      proxy: {
        '/api': 'http://localhost:8080'
      }
    },
    build: {
      rollupOptions: {
        external: ['d3-sankey']
      }
    }
  }
})
