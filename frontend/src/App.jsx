import { useState } from 'react'
import LandingPage from './components/LandingPage'
import ChatInterface from './components/ChatInterface'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="App">
        {!isAuthenticated ? (
          <LandingPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          <ChatInterface user={user} onLogout={handleLogout} />
        )}
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
