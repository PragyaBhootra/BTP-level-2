import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { FaComments, FaShieldAlt, FaBolt, FaCheckCircle, FaGoogle } from 'react-icons/fa'

const LandingPage = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Handle traditional email/password login
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (isSignUp) {
      // Sign Up validation
      if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields')
        return
      }
      
      if (password !== confirmPassword) {
        alert('Passwords do not match')
        return
      }
      
      if (password.length < 6) {
        alert('Password must be at least 6 characters')
        return
      }
      
      // Store user in localStorage (in production, use proper backend)
      const users = JSON.parse(localStorage.getItem('users') || '{}')
      
      if (users[email]) {
        alert('Email already registered. Please login.')
        return
      }
      
      users[email] = { name, password }
      localStorage.setItem('users', JSON.stringify(users))
      
      alert('Account created successfully! Please login.')
      setIsSignUp(false)
      setPassword('')
      setConfirmPassword('')
      
    } else {
      // Login validation
      if (!email || !password) {
        alert('Please enter both email and password')
        return
      }
      
      // Validate against stored users
      const users = JSON.parse(localStorage.getItem('users') || '{}')
      
      if (!users[email]) {
        alert('Email not registered. Please sign up first.')
        return
      }
      
      if (users[email].password !== password) {
        alert('Incorrect password')
        return
      }
      
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address')
        return
      }
      
      const userData = {
        email: email,
        name: users[email].name,
        picture: null
      }
      
      onLoginSuccess(userData)
    }
  }

  // Handle Google OAuth login
  const handleGoogleSuccess = (credentialResponse) => {
    try {
      setIsLoading(true)
      const decoded = jwtDecode(credentialResponse.credential)
      
      const userData = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      }
      
      onLoginSuccess(userData)
    } catch (error) {
      console.error('Google login error:', error)
      alert('Google login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    console.error('Google Login Failed')
    alert('Google login failed. Please try again.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaComments className="text-blue-600 text-3xl" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ComplaintHub
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition">How It Works</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition">About</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Voice,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}Heard & Resolved
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Report complaints effortlessly with our AI-powered system. 
                Get instant routing to the right department and faster resolutions.
              </p>
              
              {/* Sign In/Sign Up Form */}
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
                <h3 className="text-2xl font-semibold mb-2 text-gray-800">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isSignUp ? 'Sign up to file your complaint' : 'Login to continue'}
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        required={isSignUp}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  {isSignUp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        required={isSignUp}
                        minLength={6}
                      />
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition duration-200"
                  >
                    {isSignUp ? 'Create Account' : 'Login'}
                  </button>
                </form>
                
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                {/* Google Sign In */}
                <div className="flex justify-center">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      width="100%"
                    />
                  )}
                </div>
                
                {/* Toggle Sign Up/Login */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp)
                        setPassword('')
                        setConfirmPassword('')
                        setName('')
                      }}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-1">
                <div className="bg-white rounded-3xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 bg-blue-50 p-4 rounded-xl">
                      <div className="bg-blue-600 p-3 rounded-lg">
                        <FaComments className="text-white text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">AI-Powered Chat</h4>
                        <p className="text-sm text-gray-600">Smart conversation for better complaints</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 bg-purple-50 p-4 rounded-xl">
                      <div className="bg-purple-600 p-3 rounded-lg">
                        <FaBolt className="text-white text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Instant Routing</h4>
                        <p className="text-sm text-gray-600">Auto-classify to right department</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 bg-green-50 p-4 rounded-xl">
                      <div className="bg-green-600 p-3 rounded-lg">
                        <FaCheckCircle className="text-white text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Fast Resolution</h4>
                        <p className="text-sm text-gray-600">Track and resolve quickly</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4">Why Choose ComplaintHub?</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Modern complaint management powered by AI
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FaComments className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Conversations</h3>
              <p className="text-gray-600">
                AI chatbot asks relevant questions to capture all complaint details accurately.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FaBolt className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto-Classification</h3>
              <p className="text-gray-600">
                Gemini AI automatically routes your complaint to the correct department.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FaShieldAlt className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is encrypted and secure. Google authentication ensures safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Sign In', desc: 'Use your Google account' },
              { step: '2', title: 'Chat', desc: 'Describe your complaint to AI' },
              { step: '3', title: 'Review', desc: 'Confirm details & department' },
              { step: '4', title: 'Submit', desc: 'Email sent automatically' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2025 ComplaintHub. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2">Powered by Gemini AI & Google Cloud</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
