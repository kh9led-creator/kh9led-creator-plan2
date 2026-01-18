
import { Student, School, SchoolClass, Subject, Teacher, AcademicWeek } from './types.ts';

const apiRequest = async (action: string, params: Record<string, string> = {}, body?: any) => {
  // توجيه الطلبات إلى مسار /api النسبي الذي سيعالجه سيرفر Express
  const url = new URL('/api', window.location.origin);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const response = await fetch(url.toString(), {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `خطأ في الاتصال: ${response.status}`);
  }
  return response.json();
};

export const DAYS = [
  { id: 'sun', label: 'الأحد' },
  { id: 'mon', label: 'الاثنين' },
  { id: 'tue', label: 'الثلاثاء' },
  { id: 'wed', label: 'الأربعاء' },
  { id: 'thu', label: 'الخميس' }
];

export const PERIODS = [1, 2, 3, 4, 5, 6, 7];

export const formatToHijri = (dateStr: string | Date) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const hashSecurityPassword = async (password: string) => {
  return btoa(password).split('').reverse().join('');
};

export const db = {
  // --- Schools Management ---
  getSchools: async (): Promise<School[]> => {
    const data = await apiRequest('getSchools');
    return data.map((s: any) => ({
      ...s,
      adminUsername: s.admin_username,
      adminPassword: s.admin_password,
      subscriptionActive: s.subscription_active,
      expiryDate: s.expiry_date,
      headerContent: s.header_content,
      generalMessages: s.general_messages,
      weeklyNotes: s.weekly_notes,
      logoUrl: s.logo_url,
      weeklyNotesImage: s.weekly_notes_image
    }));
  },
  getSchoolBySlug: async (slug: string): Promise<School | undefined> => {
    const s = await apiRequest('getSchoolBySlug', { slug });
    if (!s) return undefined;
    return {
      ...s,
      adminUsername: s.admin_username,
      adminPassword: s.admin_password,
      subscriptionActive: s.subscription_active,
      expiryDate: s.expiry_date,
      headerContent: s.header_content,
      generalMessages: s.general_messages,
      weeklyNotes: s.weekly_notes,
      logoUrl: s.logo_url,
      weeklyNotesImage: s.weekly_notes_image
    };
  },
  saveSchool: async (school: School) => apiRequest('saveSchool', {}, school),
  deleteSchool: async (id: string) => apiRequest('deleteSchool', { id }),

  // --- Teachers Management ---
  getTeachers: async (schoolId: string): Promise<Teacher[]> => apiRequest('getTeachers', { schoolId }),
  saveTeacher: async (teacher: Teacher) => apiRequest('saveTeacher', {}, teacher),
  deleteTeacher: async (id: string) => apiRequest('deleteTeacher', { id }),

  // --- Students Management ---
  getStudents: async (schoolId: string): Promise<Student[]> => {
    const data = await apiRequest('getStudents', { schoolId });
    return data.map((s: any) => ({
      ...s,
      phoneNumber: s.phone_number
    }));
  },
  saveBulkStudents: async (students: Student[]) => apiRequest('saveBulkStudents', {}, students),
  deleteAllStudents: async (schoolId: string) => apiRequest('deleteAllStudents', { schoolId }),

  // --- Classes Management ---
  getClasses: async (schoolId: string): Promise<SchoolClass[]> => apiRequest('getClasses', { schoolId }),
  saveClass: async (classData: SchoolClass) => apiRequest('saveClass', {}, classData),
  deleteClass: async (schoolId: string, classId: string) => apiRequest('deleteClass', { schoolId, classId }),
  syncClassesFromStudents: async (schoolId: string) => apiRequest('syncClassesFromStudents', { schoolId }),

  // --- Subjects Management ---
  getSubjects: async (schoolId: string): Promise<Subject[]> => apiRequest('getSubjects', { schoolId }),
  saveSubject: async (schoolId: string, subject: Subject) => apiRequest('saveSubject', { schoolId }, subject),
  deleteSubject: async (schoolId: string, subjectId: string) => apiRequest('deleteSubject', { schoolId, subjectId }),

  // --- Schedule Management ---
  getSchedule: async (schoolId: string, classTitle: string): Promise<any> => apiRequest('getSchedule', { schoolId, classTitle }),
  saveSchedule: async (schoolId: string, classTitle: string, schedule: any) => apiRequest('saveSchedule', { schoolId, classTitle }, schedule),

  // --- Plans Management ---
  getPlans: async (schoolId: string, weekId: string): Promise<any> => {
    const rawPlans = await apiRequest('getPlans', { schoolId, weekId });
    const plansMap: Record<string, any> = {};
    if (Array.isArray(rawPlans)) {
      rawPlans.forEach((p: any) => {
        plansMap[p.plan_key] = { lesson: p.lesson, homework: p.homework, enrichment: p.enrichment };
      });
    }
    return plansMap;
  },
  savePlan: async (schoolId: string, weekId: string, planKey: string, entry: any) => 
    apiRequest('savePlan', { schoolId, weekId }, { ...entry, planKey, schoolId, weekId }),
  clearWeekPlans: async (schoolId: string, weekId: string) => apiRequest('clearWeekPlans', { schoolId, weekId }),
  archiveWeekPlans: async (schoolId: string, week: AcademicWeek) => apiRequest('archiveWeekPlans', { schoolId }, week),
  getArchivedPlans: async (schoolId: string): Promise<any[]> => {
    const data = await apiRequest('getArchivedPlans', { schoolId });
    return data.map((a: any) => ({
        ...a,
        weekId: a.week_id,
        weekName: a.week_name,
        startDate: a.start_date,
        endDate: a.end_date,
        plansData: a.plans_data
    }));
  },

  // --- Weeks Management ---
  getWeeks: async (schoolId: string): Promise<AcademicWeek[]> => {
    const data = await apiRequest('getWeeks', { schoolId });
    return data.map((w: any) => ({
      ...w,
      startDate: w.start_date,
      endDate: w.end_date,
      isActive: w.is_active
    }));
  },
  saveWeek: async (schoolId: string, week: AcademicWeek) => apiRequest('saveWeek', { schoolId }, week),
  setActiveWeek: async (schoolId: string, weekId: string) => apiRequest('setActiveWeek', { schoolId, weekId }),
  deleteWeek: async (schoolId: string, weekId: string) => apiRequest('deleteWeek', { schoolId, weekId }),
  getActiveWeek: async (schoolId: string): Promise<AcademicWeek | undefined> => {
    const weeks = await db.getWeeks(schoolId);
    return weeks.find(w => w.isActive);
  },

  // --- Attendance Management ---
  getAttendance: async (schoolId: string): Promise<any[]> => {
    const data = await apiRequest('getAttendance', { schoolId });
    return data.map((a: any) => ({
        ...a,
        teacherName: a.teacher_name,
        className: a.class_name,
        absentCount: a.absent_count
    }));
  },
  saveAttendance: async (schoolId: string, report: any) => apiRequest('saveAttendance', { schoolId }, report),
  getArchivedAttendance: async (schoolId: string): Promise<any[]> => {
    const data = await apiRequest('getArchivedAttendance', { schoolId });
    return data.map((a: any) => ({
        ...a,
        teacherName: a.teacher_name,
        className: a.class_name,
        absentCount: a.absent_count
    }));
  },
  archiveAttendance: async (schoolId: string, id: string) => apiRequest('archiveAttendance', { schoolId, id }),
  restoreAttendance: async (schoolId: string, id: string) => apiRequest('restoreAttendance', { schoolId, id }),

  // --- System Admin ---
  getSystemAdmin: async (): Promise<any> => apiRequest('getSystemAdmin'),
  updateSystemAdmin: async (admin: any) => apiRequest('updateSystemAdmin', {}, admin),

  // --- Auth & Biometrics ---
  authenticateSchool: async (username: string, password: string): Promise<School | null> => {
    const schools = await db.getSchools();
    const hashedInput = await hashSecurityPassword(password);
    return schools.find(s => s.adminUsername === username && s.adminPassword === hashedInput) || null;
  },
  registerBiometric: async (id: string, type: string): Promise<boolean> => {
    // Mock biometric registration locally
    localStorage.setItem('local_biometric_key', JSON.stringify({ id, type }));
    return true;
  },
  authenticateBiometric: async (): Promise<any> => {
    // Mock biometric authentication from localStorage
    const key = localStorage.getItem('local_biometric_key');
    if (key) {
      const { id, type } = JSON.parse(key);
      if (type === 'SCHOOL') {
        const schools = await db.getSchools();
        const school = schools.find(s => s.id === id);
        if (school) return { type: 'SCHOOL_ADMIN', data: school };
      } else if (type === 'TEACHER') {
        const schools = await db.getSchools();
        for (const s of schools) {
          const teachers = await db.getTeachers(s.id);
          const teacher = teachers.find(t => t.id === id);
          if (teacher) return { type: 'TEACHER', data: teacher };
        }
      }
    }
    return null;
  }
};
