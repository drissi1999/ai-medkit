// src/App.jsx
/**
 * AI MedKit - Main React Application
 * Medical AI assistant frontend with PWA support
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Hooks and Services
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Components
import Layout from './components/Common/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Pages (Lazy loaded for better performance)
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const PatientsPage = React.lazy(() => import('./pages/PatientsPage'));
const PatientDetailPage = React.lazy(() => import('./pages/PatientDetailPage'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const LabResultsPage = React.lazy(() => import('./pages/LabResultsPage'));
const ImagingPage = React.lazy(() => import('./pages/ImagingPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

// Create Query Client with medical-specific configurations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors (auth issues)
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});


function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('New version available! Reload to update?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });

    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <Router>
              <div className="App min-h-screen bg-gray-50">
                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#10B981',
                      },
                    },
                    error: {
                      style: {
                        background: '#EF4444',
                      },
                    },
                  }}
                />

                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      
                      {/* Chat and AI Features */}
                      <Route path="chat" element={<ChatPage />} />
                      <Route path="chat/:sessionId" element={<ChatPage />} />
                      
                      {/* Patient Management */}
                      <Route path="patients" element={<PatientsPage />} />
                      <Route path="patients/:patientId" element={<PatientDetailPage />} />
                      <Route path="patients/:patientId/session/:sessionId" element={<ChatPage />} />
                      
                      {/* Calendar and Appointments */}
                      <Route path="calendar" element={<CalendarPage />} />
                      
                      {/* Medical Analysis */}
                      <Route path="lab-results" element={<LabResultsPage />} />
                      <Route path="lab-results/:resultId" element={<LabResultsPage />} />
                      <Route path="imaging" element={<ImagingPage />} />
                      <Route path="imaging/:imageId" element={<ImagingPage />} />
                      
                      {/* User Settings */}
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>
                    
                    {/* 404 Page */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </WebSocketProvider>
        </AuthProvider>
        
        {/* React Query Dev Tools (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;