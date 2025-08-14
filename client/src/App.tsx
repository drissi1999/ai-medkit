import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Mic, 
  MessageCircle, 
  BarChart3, 
  Brain, 
  Eye, 
  Heart, 
  Bone, 
  Hand, 
  Scan,
  Play,
  Pause,
  Download,
  Send,
  Activity,
  FileText,
  Users,
  TrendingUp,
  LogOut,
  User,
  Settings,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Import API services
import { imageAPI, voiceAPI, chatAPI, dashboardAPI, reportsAPI, AudioRecorder, handleAPIError } from './services/api';

// Authentication Components
const LoginForm = ({ onLogin, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">MedKit AI</h2>
          <p className="mt-2 text-gray-600">Sign in to your medical assistant</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="doctor@hospital.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={switchToRegister}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RegisterForm = ({ onRegister, switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    hospitalName: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          specialization: formData.specialization,
          hospitalName: formData.hospitalName
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onRegister(data.user);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Registration error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join MedKit AI</h2>
          <p className="mt-2 text-gray-600">Create your medical assistant account</p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Dr. John Smith"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="doctor@hospital.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <select
              name="specialization"
              required
              value={formData.specialization}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Specialization</option>
              <option value="general">General Medicine</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="dermatology">Dermatology</option>
              <option value="ophthalmology">Ophthalmology</option>
              <option value="radiology">Radiology</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital/Clinic Name
            </label>
            <input
              type="text"
              name="hospitalName"
              required
              value={formData.hospitalName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="General Hospital"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={switchToLogin}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Medical AI Dashboard Component
const MedicalAIDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedImageType, setSelectedImageType] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentExamId, setCurrentExamId] = useState(null);
  const [audioRecorder] = useState(new AudioRecorder());
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [transcriptionResult, setTranscriptionResult] = useState(null);

  const imageTypes = [
    { id: 'chest', label: 'Chest X-Ray', icon: Heart, description: 'Lung, heart, and chest cavity analysis' },
    { id: 'brain', label: 'Brain MRI/CT', icon: Brain, description: 'Neurological imaging analysis' },
    { id: 'eyes', label: 'Eye Examination', icon: Eye, description: 'Retinal and ocular imaging' },
    { id: 'bones', label: 'Bone/Orthopedic', icon: Bone, description: 'Fractures and bone density' },
    { id: 'skin', label: 'Dermatology', icon: Scan, description: 'Skin lesions and conditions' },
    { id: 'hands', label: 'Hand/Extremities', icon: Hand, description: 'Hand and extremity imaging' }
  ];

  const examTypes = [
    { id: 'general', label: 'General Consultation' },
    { id: 'cardiology', label: 'Cardiology Exam' },
    { id: 'neurology', label: 'Neurology Assessment' },
    { id: 'orthopedic', label: 'Orthopedic Evaluation' },
    { id: 'dermatology', label: 'Dermatology Check' },
    { id: 'ophthalmology', label: 'Eye Examination' }
  ];

  // Load dashboard stats on component mount
  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Initialize chat conversation when switching to chat tab
  useEffect(() => {
    if (activeTab === 'chat' && !currentConversationId) {
      initializeChatConversation();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setDashboardStats(response.stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  const initializeChatConversation = async () => {
    try {
      const response = await chatAPI.createConversation();
      setCurrentConversationId(response.conversationId);
      setChatHistory([{
        type: 'ai',
        message: `Hello Dr. ${user.name}! I'm your AI medical assistant. How can I help you today?`,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedImage(URL.createObjectURL(file));
    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await imageAPI.analyzeImage(file, selectedImageType);
      setAnalysisResult(response.analysis);
      await loadDashboardStats(); // Refresh stats
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const startVoiceExam = async () => {
    if (!selectedExamType) {
      alert('Please select an examination type first');
      return;
    }

    try {
      setLoading(true);
      const response = await voiceAPI.startExam(selectedExamType);
      setCurrentExamId(response.examId);
      
      const recordingStarted = await audioRecorder.startRecording();
      if (recordingStarted) {
        setIsRecording(true);
      } else {
        alert('Failed to start recording. Please check microphone permissions.');
      }
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const stopVoiceExam = async () => {
    try {
      setLoading(true);
      const audioBlob = await audioRecorder.stopRecording();
      setIsRecording(false);

      if (audioBlob && currentExamId) {
        const response = await voiceAPI.uploadAudio(currentExamId, audioBlob);
        setTranscriptionResult(response);
        await loadDashboardStats(); // Refresh stats
      }
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopVoiceExam();
    } else {
      startVoiceExam();
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !currentConversationId) return;

    const userMessage = {
      type: 'user',
      message: chatMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(currentConversationId, chatMessage);
      
      const aiMessage = {
        type: 'ai',
        message: response.response,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, aiMessage]);
      await loadDashboardStats(); // Refresh stats
    } catch (error) {
      setChatHistory(prev => [...prev, {
        type: 'ai',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    if (!transcriptionResult) return;

    try {
      setLoading(true);
      const response = await reportsAPI.generateReport(
        'voice_exam',
        currentExamId,
        transcriptionResult
      );
      
      // Open download link
      reportsAPI.downloadReport(response.reportId);
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const renderImagingAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Imaging Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imageTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedImageType(type.id)}
                disabled={loading}
                className={`p-4 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 ${
                  selectedImageType === type.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
              >
                <IconComponent className={`w-8 h-8 mx-auto mb-2 ${
                  selectedImageType === type.id ? 'text-green-600' : 'text-gray-600'
                }`} />
                <h4 className="font-medium text-gray-800">{type.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {selectedImageType && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload Medical Image</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop your medical image here, or</p>
            <label className={`inline-block px-6 py-2 rounded-lg cursor-pointer transition-colors ${
              loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            } text-white`}>
              {loading ? 'Processing...' : 'Choose File'}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
          </div>
          
          {uploadedImage && (
            <div className="mt-6">
              <img src={uploadedImage} alt="Uploaded medical image" className="max-w-md mx-auto rounded-lg shadow-md" />
              
              {loading && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-600" />
                    <h4 className="font-medium text-blue-800">AI Analysis in Progress...</h4>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              )}

              {analysisResult && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Analysis Complete</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Diagnosis:</strong> {analysisResult.diagnosis}</p>
                    <p><strong>Confidence:</strong> {(analysisResult.confidence * 100).toFixed(1)}%</p>
                    <p><strong>Recommendations:</strong> {analysisResult.recommendations}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderVoiceAssistant = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Examination Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {examTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedExamType(type.id)}
              disabled={isRecording || loading}
              className={`p-3 rounded-lg border transition-all duration-200 text-left disabled:opacity-50 ${
                selectedExamType === type.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {selectedExamType && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Voice Recording</h3>
          <div className="text-center">
            <div className={`w-32 h-32 rounded-full border-4 mx-auto mb-6 flex items-center justify-center ${
              isRecording ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
            }`}>
              <button
                onClick={toggleRecording}
                disabled={loading && !isRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading && !isRecording ? (
                  <Loader className="w-8 h-8 text-white animate-spin" />
                ) : isRecording ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              {isRecording ? 'Recording in progress...' : 'Click to start recording examination'}
            </p>
            {isRecording && (
              <div className="text-sm text-red-600 animate-pulse">
                🔴 Live Recording - Listening to consultation...
              </div>
            )}
          </div>

          {transcriptionResult && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Transcript</h4>
                <p className="text-sm text-gray-600">{transcriptionResult.transcript}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">AI Analysis Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Summary:</strong> {transcriptionResult.summary}</p>
                  <p><strong>Diagnosis:</strong> {transcriptionResult.diagnosis}</p>
                  <p><strong>Recommendations:</strong> {transcriptionResult.recommendations}</p>
                </div>
                <button 
                  onClick={generatePDFReport}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mt-3 disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {loading ? 'Generating...' : 'Download PDF Report'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderChatbot = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-96 flex flex-col">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Medical Assistant</h3>
      <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
        <div className="space-y-3">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 max-w-xs ${
                chat.type === 'ai'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800 ml-auto'
              }`}
            >
              <p className="text-sm">{chat.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(chat.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
          {loading && (
            <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <p className="text-sm text-gray-600">AI is thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Ask about diagnosis, treatment options, or medical decisions..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          onKeyPress={(e) => e.key === 'Enter' && !loading && sendChatMessage()}
          disabled={loading}
        />
        <button
          onClick={sendChatMessage}
          disabled={loading || !chatMessage.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const defaultStats = {
      imagesAnalyzed: 0,
      voiceExams: 0,
      chatMessages: 0,
      totalDiagnoses: 0
    };

    const stats = dashboardStats || defaultStats;
    const statsArray = [
      { label: 'Images Analyzed', value: stats.imagesAnalyzed, icon: Scan, color: 'text-green-600' },
      { label: 'Voice Exams', value: stats.voiceExams, icon: Mic, color: 'text-blue-600' },
      { label: 'Chat Consultations', value: stats.chatMessages, icon: MessageCircle, color: 'text-purple-600' },
      { label: 'Total Diagnoses', value: stats.totalDiagnoses, icon: Activity, color: 'text-emerald-600' }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsArray.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
               <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-gray-600">{stat.label}</p>
                   <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                 </div>
                 <IconComponent className={`w-8 h-8 ${stat.color}`} />
               </div>
             </div>
           );
         })}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
           <h3 className="text-lg font-semibold text-gray-800 mb-4">Welcome Back, Dr. {user.name}</h3>
           <div className="space-y-3">
             <div className="p-3 bg-green-50 rounded-lg">
               <p className="text-sm font-medium text-green-800">Ready to assist with medical imaging analysis</p>
               <p className="text-xs text-green-600">AI models loaded and ready</p>
             </div>
             <div className="p-3 bg-blue-50 rounded-lg">
               <p className="text-sm font-medium text-blue-800">Voice examination system active</p>
               <p className="text-xs text-blue-600">Speech recognition ready</p>
             </div>
             <div className="p-3 bg-purple-50 rounded-lg">
               <p className="text-sm font-medium text-purple-800">AI medical assistant online</p>
               <p className="text-xs text-purple-600">Ready for consultations</p>
             </div>
           </div>
         </div>

         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
           <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
           <div className="space-y-2">
             <button
               onClick={() => setActiveTab('imaging')}
               className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
             >
               <Scan className="w-5 h-5 text-green-600" />
               <span>Analyze Medical Image</span>
             </button>
             <button
               onClick={() => setActiveTab('voice')}
               className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
             >
               <Mic className="w-5 h-5 text-blue-600" />
               <span>Start Voice Examination</span>
             </button>
             <button
               onClick={() => setActiveTab('chat')}
               className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
             >
               <MessageCircle className="w-5 h-5 text-purple-600" />
               <span>Consult AI Assistant</span>
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 };

 return (
   <div className="min-h-screen bg-gray-50">
     {/* Header */}
     <header className="bg-white shadow-sm border-b border-gray-200">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between items-center h-16">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
               <Activity className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-xl font-bold text-gray-900">MedKit AI</h1>
               <p className="text-sm text-gray-600">Medical AI Assistant</p>
             </div>
           </div>
           <div className="flex items-center gap-4">
             <span className="text-sm text-gray-600">Dr. {user.name}</span>
             <span className="text-xs text-gray-500">{user.specialization}</span>
             <button
               onClick={onLogout}
               className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
             >
               <LogOut className="w-4 h-4" />
               Logout
             </button>
           </div>
         </div>
       </div>
     </header>

     {/* Navigation */}
     <nav className="bg-white border-b border-gray-200">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex space-x-8">
           {[
             { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
             { id: 'imaging', label: 'Image Analysis', icon: Scan },
             { id: 'voice', label: 'Voice Assistant', icon: Mic },
             { id: 'chat', label: 'AI Chatbot', icon: MessageCircle }
           ].map((tab) => {
             const IconComponent = tab.icon;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-3 py-4 border-b-2 transition-colors ${
                   activeTab === tab.id
                     ? 'border-green-500 text-green-600'
                     : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                 }`}
               >
                 <IconComponent className="w-4 h-4" />
                 {tab.label}
               </button>
             );
           })}
         </div>
       </div>
     </nav>

     {/* Main Content */}
     <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {activeTab === 'dashboard' && renderDashboard()}
       {activeTab === 'imaging' && renderImagingAnalysis()}
       {activeTab === 'voice' && renderVoiceAssistant()}
       {activeTab === 'chat' && renderChatbot()}
     </main>
   </div>
 );
};

// Main App Component with Authentication State Management
const MedKitApp = () => {
 const [user, setUser] = useState(null);
 const [authView, setAuthView] = useState('login'); // 'login' or 'register'
 const [loading, setLoading] = useState(true);

 // Check for existing auth token on app load
 useEffect(() => {
   const checkAuth = async () => {
     const token = localStorage.getItem('token');
     
     if (token) {
       try {
         const response = await fetch('/api/auth/me', {
           headers: { Authorization: `Bearer ${token}` }
         });
         
         if (response.ok) {
           const userData = await response.json();
           setUser(userData);
         } else {
           localStorage.removeItem('token');
         }
       } catch (error) {
         console.error('Auth check failed:', error);
         localStorage.removeItem('token');
       }
     }
     
     setLoading(false);
   };

   checkAuth();
 }, []);

 const handleLogin = (userData) => {
   setUser(userData);
 };

 const handleRegister = (userData) => {
   setUser(userData);
 };

 const handleLogout = () => {
   localStorage.removeItem('token');
   setUser(null);
   setAuthView('login');
 };

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="text-center">
         <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
           <Activity className="w-8 h-8 text-white" />
         </div>
         <p className="text-gray-600">Loading MedKit AI...</p>
       </div>
     </div>
   );
 }

 // If user is not authenticated, show auth forms
 if (!user) {
   if (authView === 'login') {
     return (
       <LoginForm 
         onLogin={handleLogin}
         switchToRegister={() => setAuthView('register')}
       />
     );
   } else {
     return (
       <RegisterForm 
         onRegister={handleRegister}
         switchToLogin={() => setAuthView('login')}
       />
     );
   }
 }

 // If user is authenticated, show the main dashboard
 return (
   <MedicalAIDashboard 
     user={user}
     onLogout={handleLogout}
   />
 );
};

export default MedKitApp;
