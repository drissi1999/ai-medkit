import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MedicalDashboard from "./components/MedicalDashboard";
import AuthForm from "./components/AuthForm";
import NotFound from "./pages/not-found";
import { Toaster } from "sonner";
import "@fontsource/inter";

const queryClient = new QueryClient();

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNumber: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on app load
    const token = localStorage.getItem('medkit-token');
    if (token) {
      // In production, validate token with server
      setIsAuthenticated(true);
      // Set demo user data
      setUser({
        id: 'demo-user',
        email: 'doctor@demo.com',
        firstName: 'Dr. John',
        lastName: 'Doe',
        specialty: 'Internal Medicine',
        licenseNumber: 'MD-123456',
        role: 'doctor'
      });
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData.user);
    setIsAuthenticated(true);
    localStorage.setItem('medkit-token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('medkit-token');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading AI Medical Assistant...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthForm onLogin={handleLogin} />
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<MedicalDashboard user={user} onLogout={handleLogout} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;