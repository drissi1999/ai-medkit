const API_BASE_URL = '/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function for form data requests
const getAuthHeadersFormData = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

// ======================
// IMAGE ANALYSIS API
// ======================

export const imageAPI = {
  // Analyze medical image
  analyzeImage: async (file, imageType, patientContext = null) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('imageType', imageType);
    if (patientContext) {
      formData.append('patientContext', JSON.stringify(patientContext));
    }

    const response = await fetch(`${API_BASE_URL}/medical/image/analyze`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData
    });

    if (!response.ok) {
      throw new Error('Image analysis failed');
    }

    return response.json();
  },

  // Get analysis history
  getHistory: async (page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/medical/image/history?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get image history');
    }

    return response.json();
  }
};

// ======================
// VOICE EXAMINATION API
// ======================

export const voiceAPI = {
  // Start voice examination
  startExam: async (examType, patientContext = null) => {
    const response = await fetch(`${API_BASE_URL}/medical/voice/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ examType, patientContext })
    });

    if (!response.ok) {
      throw new Error('Failed to start voice examination');
    }

    return response.json();
  },

  // Upload audio recording
  uploadAudio: async (examId, audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch(`${API_BASE_URL}/medical/voice/upload/${examId}`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData
    });

    if (!response.ok) {
      throw new Error('Audio upload failed');
    }

    return response.json();
  },

  // Get examination history
  getHistory: async (page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/medical/voice/history?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get voice history');
    }

    return response.json();
  }
};

// ======================
// CHAT ASSISTANT API
// ======================

export const chatAPI = {
  // Create new conversation
  createConversation: async (title = 'New Consultation') => {
    const response = await fetch(`${API_BASE_URL}/medical/chat/conversation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    return response.json();
  },

  // Send message
  sendMessage: async (conversationId, message, messageType = 'question') => {
    const response = await fetch(`${API_BASE_URL}/medical/chat/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversationId, message, messageType })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  // Get chat history
  getHistory: async (conversationId) => {
    const response = await fetch(`${API_BASE_URL}/medical/chat/history/${conversationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get chat history');
    }

    return response.json();
  }
};

// ======================
// DASHBOARD API
// ======================

export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/medical/dashboard/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get dashboard stats');
    }

    return response.json();
  }
};

// ======================
// REPORTS API
// ======================

export const reportsAPI = {
  // Generate PDF report
  generateReport: async (reportType, relatedId, reportData) => {
    const response = await fetch(`${API_BASE_URL}/medical/report/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reportType, relatedId, reportData })
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return response.json();
  },

  // Download report
  downloadReport: (reportId) => {
    const token = localStorage.getItem('token');
    window.open(`${API_BASE_URL}/report/download/${reportId}?token=${token}`, '_blank');
  }
};

// ======================
// AUDIO RECORDING UTILITY
// ======================

export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.chunks, { type: 'audio/webm' });
          this.cleanup();
          resolve(blob);
        };
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }
}

// ======================
// ERROR HANDLING UTILITY
// ======================

export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401') || error.message.includes('unauthorized')) {
    // Redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  }
  
  return error.message || 'An unexpected error occurred';
};
