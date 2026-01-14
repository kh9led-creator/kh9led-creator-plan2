
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { School, UserRole, AppState } from './types.ts';
import { db } from './constants.tsx';
import LandingPage from './pages/LandingPage.tsx';
import SchoolDashboard from './pages/SchoolDashboard.tsx';
import TeacherDashboard from './pages/TeacherDashboard.tsx';
import PublicPlanView from './pages/PublicPlanView.tsx';
import BulkStudentPlans from './pages/BulkStudentPlans.tsx';
import SystemAdminDashboard from './pages/SystemAdminDashboard.tsx';
import Login from './pages/Login.tsx';
import TeacherLogin from './pages/TeacherLogin.tsx';
import SchoolRegistration from './pages/SchoolRegistration.tsx';
import SystemAdminLogin from './pages/SystemAdminLogin.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentSchool: null,
    currentUser: null,
    role: 'PUBLIC',
    isAuthenticated: false
  });
  const [isInitializing, setIsInitializing] = useState(true);

  // استعادة الجلسة من التخزين المحلي (للتوكن فقط) والتحقق منها من السيرفر
  useEffect(() => {
    const recoverSession = async () => {
      const savedSession = localStorage.getItem('active_session');
      if (savedSession) {
        try {
          const { role, schoolId, userId } = JSON.parse(savedSession);
          // هنا يفضل جلب بيانات المدرسة/المعلم الطازجة من قاعدة البيانات
          if (role === 'SCHOOL_ADMIN') {
            const schools = await db.getSchools();
            const school = schools.find(s => s.id === schoolId);
            if (school) {
              setState({ currentSchool: school, currentUser: { name: 'مدير المدرسة' }, role, isAuthenticated: true });
            }
          }
          // يمكنك إضافة منطق استعادة المعلم هنا أيضاً
        } catch (e) {
          console.error("Session recovery failed", e);
        }
      }
      setIsInitializing(false);
    };
    recoverSession();
  }, []);

  const login = (role: UserRole, school: School | null, user: any) => {
    const sessionData = { role, schoolId: school?.id, userId: user?.id };
    localStorage.setItem('active_session', JSON.stringify(sessionData));
    setState({ currentSchool: school, currentUser: user, role, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('active_session');
    setState({ currentSchool: null, currentUser: null, role: 'PUBLIC', isAuthenticated: false });
  };

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-slate-500">جاري الاتصال بقاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-['Tajawal'] text-slate-900 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/register-school" element={<SchoolRegistration onLogin={login} />} />
          <Route path="/system-access-portal" element={<SystemAdminLogin onLogin={login} />} />
          <Route path="/school/:schoolSlug/teacher-login" element={<TeacherLogin onLogin={login} />} />

          <Route 
            path="/admin/*" 
            element={
              state.role === 'SYSTEM_ADMIN' 
                ? <SystemAdminDashboard onLogout={logout} /> 
                : <Navigate to="/system-access-portal" />
            } 
          />

          <Route 
            path="/school/*" 
            element={
              state.role === 'SCHOOL_ADMIN' && state.currentSchool
                ? <SchoolDashboard school={state.currentSchool!} onLogout={logout} /> 
                : <Navigate to="/login" />
            } 
          />

          <Route 
            path="/teacher/*" 
            element={
              state.role === 'TEACHER' && state.currentSchool
                ? <TeacherDashboard teacher={state.currentUser!} school={state.currentSchool!} onLogout={logout} /> 
                : <Navigate to="/login" />
            } 
          />

          <Route path="/p/:schoolSlug" element={<PublicPlanView />} />
          <Route path="/p/:schoolSlug/bulk/students" element={<BulkStudentPlans />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
