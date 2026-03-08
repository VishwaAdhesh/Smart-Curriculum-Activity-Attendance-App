import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AttendanceManagement from './pages/AttendanceManagement';
import ActivityTracker from './pages/ActivityTracker';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Courses from './pages/Courses';
import Profile from './pages/Profile';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Auth Context
const AuthContext = createContext(null);

// API Base URL
const API_URL = '/api';

// Custom hook for API calls
const useApi = () => {
  const { token } = useContext(AuthContext);

  const api = {
    get: async (endpoint) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    },
    post: async (endpoint, data) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    put: async (endpoint, data) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    delete: async (endpoint) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    }
  };

  return api;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children, role }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout role="student">
                <Routes>
                  <Route index element={<StudentDashboard />} />
                  <Route path="courses" element={<Courses />} />
                  <Route path="activities" element={<ActivityTracker />} />
                  <Route path="profile" element={<Profile />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <Layout role="teacher">
                <Routes>
                  <Route index element={<TeacherDashboard />} />
                  <Route path="attendance" element={<AttendanceManagement />} />
                  <Route path="courses" element={<Courses />} />
                  <Route path="activities" element={<ActivityTracker />} />
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                  <Route path="profile" element={<Profile />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout role="admin">
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="attendance" element={<AttendanceManagement />} />
                  <Route path="courses" element={<Courses />} />
                  <Route path="activities" element={<ActivityTracker />} />
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                  <Route path="profile" element={<Profile />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export { AuthContext, useApi };
export default App;

