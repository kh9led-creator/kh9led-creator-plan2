
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import LandingPage from './pages/LandingPage';
import SystemAdminLogin from './pages/SystemAdminLogin';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import Login from './pages/Login';
import TeacherLogin from './pages/TeacherLogin';
import PublicPlanView from './pages/PublicPlanView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('khotati_prod_session');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('khotati_prod_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('khotati_prod_session');
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* بوابة المشرف العام */}
        <Route 
          path="/system-access-portal" 
          element={user?.role === 'SYSTEM_ADMIN' ? <Navigate to="/admin-dashboard" /> : <SystemAdminLogin onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/admin-dashboard/*" 
          element={user?.role === 'SYSTEM_ADMIN' ? <SystemAdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/system-access-portal" />} 
        />

        {/* بوابة المدارس والجمهور */}
        <Route path="/p/:schoolSlug" element={<PublicPlanView />} />
        <Route path="/school/:schoolSlug/teacher-login" element={<TeacherLogin onLogin={handleLogin} />} />
        
        <Route 
          path="/login" 
          element={user?.role === 'SCHOOL_ADMIN' ? <Navigate to="/school" /> : <Login onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/school/*" 
          element={user?.role === 'SCHOOL_ADMIN' || user?.role === 'TEACHER' ? <SchoolDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
