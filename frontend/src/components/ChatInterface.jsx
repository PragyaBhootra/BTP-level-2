import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { FaPaperPlane, FaSignOutAlt, FaEnvelope, FaRobot, FaUser, FaPaperclip, FaTimes } from 'react-icons/fa'

const ChatInterface = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}`)
  const [complaintData, setComplaintData] = useState({})
  const [canSendEmail, setCanSendEmail] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [aiAdvice, setAiAdvice] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        role: 'assistant',
        content: `Hello ${user.name}! 👋 I'm here to help you file a complaint. Please describe the issue you're facing, and I'll gather all the necessary details.`
      }
    ])
  }, [user.name])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Send to backend
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage,
        session_id: sessionId
      })

      // Add bot response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response
      }])

      // Update complaint data
      if (response.data.complaint_data) {
        setComplaintData(response.data.complaint_data)
        
        // Enable email button if we have at least description and one other field
        const data = response.data.complaint_data
        const hasDescription = data.description && data.description.trim().length > 0
        const hasOtherInfo = Object.keys(data).length >= 2
        
        setCanSendEmail(hasDescription && hasOtherInfo)
      }
      
      // Also check if bot says to send email
      const botResponse = response.data.response.toLowerCase()
      if (botResponse.includes('send email') || 
          botResponse.includes('click') && botResponse.includes('email') ||
          botResponse.includes('submit your complaint')) {
        setCanSendEmail(true)
      }

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = async () => {
    setIsLoading(true)

    try {
      // First classify the department
      const classifyResponse = await axios.post(`${API_URL}/api/classify-department`, {
        complaint: JSON.stringify(complaintData),
        session_id: sessionId
      })

      const department = classifyResponse.data.department

      // Prepare form data with attachments
      const formData = new FormData()
      formData.append('department', department)
      formData.append('complaint_data', JSON.stringify(complaintData))
      formData.append('user_email', user.email)
      formData.append('session_id', sessionId)
      
      // Add attachments
      attachments.forEach((file, index) => {
        formData.append('attachments', file)
      })

      // Send email with attachments
      const emailResponse = await axios.post(`${API_URL}/api/send-email`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (emailResponse.data.success) {
        // Get AI advice
        const advice = emailResponse.data.advice || 'Your complaint has been processed.'
        setAiAdvice(advice)
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ Your complaint has been successfully sent to the ${department.replace('_', ' ')} department! You'll receive a copy at ${user.email}. The department will contact you soon.`
        }])
        
        // Show AI advice in chat
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `📋 **AI Recommendations for You:**\n\n${advice}`,
            isAdvice: true
          }])
        }, 1000)
        
        setCanSendEmail(false)
        setAttachments([]) // Clear attachments
      }

    } catch (error) {
      console.error('Email error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Failed to send email. Please try again or contact support.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // Limit file size to 5MB each
    const maxSize = 5 * 1024 * 1024 // 5MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size is 5MB.`)
        return false
      }
      return true
    })
    
    setAttachments(prev => [...prev, ...validFiles])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FaRobot className="text-blue-600 text-3xl" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Complaint Assistant</h1>
                <p className="text-sm text-gray-600">AI-Powered Support</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-blue-600"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          
          {/* Messages Area */}
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {message.role === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
                    </div>
                    
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isAdvice
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-800 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-gray-50">
              {/* Attachments Display */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
                      <FaPaperclip className="text-blue-600" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mb-3">
                <button
                  onClick={handleSendEmail}
                  disabled={isLoading || !canSendEmail}
                  className={`w-full px-4 py-3 rounded-xl transition flex items-center justify-center space-x-2 font-semibold ${
                    canSendEmail 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!canSendEmail ? 'Please provide more details about your complaint first' : 'Click to send your complaint via email'}
                >
                  <FaEnvelope />
                  <span>{canSendEmail ? 'Send Complaint Email' : 'Email (Needs More Info)'}</span>
                  {attachments.length > 0 && (
                    <span className="ml-2 bg-white text-green-600 px-2 py-1 rounded-full text-xs">
                      {attachments.length} file{attachments.length > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex space-x-2">
                {/* File Attachment Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-300 transition flex items-center space-x-2"
                  title="Attach files (images, PDFs, documents)"
                >
                  <FaPaperclip />
                </button>
                
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <FaPaperPlane />
                  <span className="hidden md:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
