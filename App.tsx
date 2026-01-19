
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { School, UserRole, AppState } from './types';
import { db } from './constants';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SchoolDashboard from './pages/SchoolDashboard';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import SystemAdminLogin from './pages/SystemAdminLogin';
import SchoolRegistration from './pages/SchoolRegistration';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentSchool: null,
    currentUser: null,
    role: 'PUBLIC',
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoverSession = async () => {
      const saved = localStorage.getItem('active_session');
      if (saved) {
        try {
          const { role, schoolId, userId } = JSON.parse(saved);
          if (role === 'SCHOOL_ADMIN' && schoolId) {
            const schools = await db.getSchools();
            const school = schools.find(s => s.id === schoolId);
            if (school) {
              setState({ currentSchool: school, currentUser: { name: 'مدير المدرسة' }, role, isAuthenticated: true });
            }
          } else if (role === 'SYSTEM_ADMIN') {
            setState({ currentSchool: null, currentUser: { name: 'المشرف العام' }, role: 'SYSTEM_ADMIN', isAuthenticated: true });
          }
          // يمكن إضافة استعادة جلسة المعلم هنا بنفس الطريقة
        } catch (e) {
          localStorage.removeItem('active_session');
        }
      }
      setLoading(false);
    };
    recoverSession();
  }, []);

  const handleLogin = (role: UserRole, school: School | null, user: any) => {
    localStorage.setItem('active_session', JSON.stringify({ role, schoolId: school?.id, userId: user?.id }));
    setState({ currentSchool: school, currentUser: user, role, isAuthenticated: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('active_session');
    setState({ currentSchool: null, currentUser: null, role: 'PUBLIC', isAuthenticated: false });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register-school" element={<SchoolRegistration onLogin={handleLogin} />} />
        <Route path="/system-access-portal" element={<SystemAdminLogin onLogin={handleLogin} />} />

        {/* مسار مدير المدرسة المحمي */}
        <Route 
          path="/school/*" 
          element={
            state.role === 'SCHOOL_ADMIN' && state.currentSchool 
              ? <SchoolDashboard school={state.currentSchool} onLogout={handleLogout} /> 
              : <Navigate to="/login" />
          } 
        />

        {/* مسار مدير النظام المحمي */}
        <Route 
          path="/admin-dashboard/*" 
          element={
            state.role === 'SYSTEM_ADMIN' 
              ? <SystemAdminDashboard onLogout={handleLogout} /> 
              : <Navigate to="/system-access-portal" />
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
