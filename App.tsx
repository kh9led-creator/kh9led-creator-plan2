
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { School, UserRole, AppState } from './types.ts';
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
    role: 'PUBLIC'
  });

  const login = (role: UserRole, school: School | null, user: any) => {
    setState({ currentSchool: school, currentUser: user, role });
  };

  const logout = () => {
    setState({ currentSchool: null, currentUser: null, role: 'PUBLIC' });
  };

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

          {/* المسار العام الموحد الجديد */}
          <Route path="/p/:schoolSlug" element={<PublicPlanView />} />
          <Route path="/p/:schoolSlug/bulk/students" element={<BulkStudentPlans />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
