import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black text-white p-10 flex flex-col items-center justify-center text-center">
          <h1 className="text-xl font-bold mb-4">Something went wrong.</h1>
          <p className="text-red-400 text-sm mb-6 max-w-md">{this.state.error?.message || "An unexpected error occurred."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black font-bold rounded-2xl active:scale-95 transition-transform"
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Check if on desktop (not mobile)
const isDesktop = window.innerWidth > 500

function PhoneFrame({ children }) {
  if (!isDesktop) return children
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#1a1a1a',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '390px',
        height: '844px',
        borderRadius: '55px',
        background: '#000',
        padding: '12px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        position: 'relative',
        display: 'flex'
      }}>
        <div style={{
          flex: 1,
          borderRadius: '40px',
          overflow: 'hidden',
          position: 'relative',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Notch */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '150px',
            height: '30px',
            background: '#000',
            borderRadius: '0 0 20px 20px',
            zIndex: 100
          }} />
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <PhoneFrame>
        <App />
      </PhoneFrame>
    </ErrorBoundary>
  </StrictMode>,
)
