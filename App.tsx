
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import LandingPage from './pages/LandingPage';
import SystemAdminLogin from './pages/SystemAdminLogin';
import Login from './pages/Login';
import SchoolDashboard from './pages/SchoolDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // استعادة الجلسة عند تحميل الصفحة
  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Update handleLogin to accept either a User object or (role, school, user)
  const handleLogin = (roleOrUser: User | UserRole, school?: any, userObj?: any) => {
    let userData: User;

    if (typeof roleOrUser === 'string') {
      // Logic for multi-parameter login (Login.tsx, TeacherLogin.tsx)
      userData = {
        id: school?.id || userObj?.id || 'temp',
        name: userObj?.name || school?.name || 'User',
        username: userObj?.username || school?.adminUsername || 'user',
        role: roleOrUser as UserRole
      };
    } else {
      // Logic for single User parameter (SystemAdminLogin.tsx)
      userData = roleOrUser as User;
    }

    setUser(userData);
    localStorage.setItem('app_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 font-['Tajawal']">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div dir="rtl" className="font-['Tajawal'] min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* بوابة المشرف العام */}
          <Route 
            path="/system-access-portal" 
            element={user?.role === 'SYSTEM_ADMIN' ? <Navigate to="/admin-dashboard" /> : <SystemAdminLogin onLogin={handleLogin} />} 
          />
          
          {/* دخول المدارس */}
          <Route 
            path="/login" 
            element={user?.role === 'SCHOOL_ADMIN' ? <Navigate to="/school" /> : <Login onLogin={handleLogin as any} />} 
          />

          {/* لوحة تحكم المدرسة المحمية */}
          <Route 
            path="/school/*" 
            element={user?.role === 'SCHOOL_ADMIN' ? <SchoolDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />

          {/* يمكن إضافة مسار لوحة تحكم المشرف العام هنا بنفس الطريقة */}
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
