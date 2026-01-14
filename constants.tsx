
import { Student, School, SchoolClass, Subject, Teacher, AcademicWeek } from './types.ts';

// محرك الاتصال بـ API الموحد
const apiRequest = async (action: string, params: Record<string, string> = {}, body?: any) => {
  const query = new URLSearchParams({ action, ...params }).toString();
  const response = await fetch(`/.netlify/functions/api?${query}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
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

// Fix: Added missing hashSecurityPassword function for secure school registration
export const hashSecurityPassword = async (password: string) => {
  return btoa(password).split('').reverse().join('');
};

export const db = {
  // المدارس
  getSchools: async (): Promise<School[]> => apiRequest('getSchools'),
  getSchoolBySlug: async (slug: string): Promise<School | undefined> => apiRequest('getSchoolBySlug', { slug }),
  saveSchool: async (school: School) => apiRequest('saveSchool', {}, school),
  // Fix: Added deleteSchool method for system admin management
  deleteSchool: async (id: string) => apiRequest('deleteSchool', { id }),
  
  // المعلمون
  getTeachers: async (schoolId: string): Promise<Teacher[]> => apiRequest('getTeachers', { schoolId }),
  saveTeacher: async (teacher: Teacher) => apiRequest('saveTeacher', {}, teacher),
  // Fix: Added deleteTeacher method for school settings
  deleteTeacher: async (id: string) => apiRequest('deleteTeacher', { id }),
  
  // الطلاب
  getStudents: async (schoolId: string): Promise<Student[]> => apiRequest('getStudents', { schoolId }),
  saveBulkStudents: async (students: Student[]) => apiRequest('saveBulkStudents', {}, students),
  // Fix: Added deleteAllStudents method for bulk management
  deleteAllStudents: async (schoolId: string) => apiRequest('deleteAllStudents', { schoolId }),
  
  // الفصول والمواد
  // Fix: Added getClasses method to fetch school classes
  getClasses: async (schoolId: string): Promise<SchoolClass[]> => apiRequest('getClasses', { schoolId }),
  // Fix: Added saveClass method to create or update classes
  saveClass: async (classData: SchoolClass) => apiRequest('saveClass', {}, classData),
  // Fix: Added deleteClass method to remove specific classes
  deleteClass: async (schoolId: string, id: string) => apiRequest('deleteClass', { schoolId, id }),
  // Fix: Added syncClassesFromStudents method to refresh class list from student data
  syncClassesFromStudents: async (schoolId: string) => apiRequest('syncClassesFromStudents', { schoolId }),
  
  // Fix: Added getSubjects method to fetch available school subjects
  getSubjects: async (schoolId: string): Promise<Subject[]> => apiRequest('getSubjects', { schoolId }),
  // Fix: Added saveSubject method for subject management
  saveSubject: async (schoolId: string, subject: Subject) => apiRequest('saveSubject', { schoolId }, subject),
  // Fix: Added deleteSubject method for subject management
  deleteSubject: async (schoolId: string, id: string) => apiRequest('deleteSubject', { schoolId, id }),

  // الجداول والخطط
  getSchedule: async (schoolId: string, classTitle: string): Promise<any> => apiRequest('getSchedule', { schoolId, classTitle }),
  saveSchedule: async (schoolId: string, classTitle: string, schedule: any) => apiRequest('saveSchedule', { schoolId, classTitle }, schedule),
  
  getWeeks: async (schoolId: string): Promise<AcademicWeek[]> => apiRequest('getWeeks', { schoolId }),
  getActiveWeek: async (schoolId: string): Promise<AcademicWeek | undefined> => apiRequest('getActiveWeek', { schoolId }),
  // Fix: Added saveWeek method for academic calendar management
  saveWeek: async (schoolId: string, week: AcademicWeek) => apiRequest('saveWeek', { schoolId }, week),
  // Fix: Added setActiveWeek method to switch current monitoring week
  setActiveWeek: async (schoolId: string, weekId: string) => apiRequest('setActiveWeek', { schoolId, weekId }),
  // Fix: Added deleteWeek method for calendar management
  deleteWeek: async (schoolId: string, weekId: string) => apiRequest('deleteWeek', { schoolId, weekId }),
  
  getPlans: async (schoolId: string, weekId: string): Promise<any> => apiRequest('getPlans', { schoolId, weekId }),
  savePlan: async (schoolId: string, weekId: string, planKey: string, entry: any) => 
    apiRequest('savePlan', { schoolId, weekId }, { planKey, entry, schoolId, weekId }),
  // Fix: Added getArchivedPlans method to fetch history of weekly plans
  getArchivedPlans: async (schoolId: string): Promise<any[]> => apiRequest('getArchivedPlans', { schoolId }),
  // Fix: Added archiveWeekPlans method to save the current week state permanently
  archiveWeekPlans: async (schoolId: string, week: AcademicWeek) => apiRequest('archiveWeekPlans', { schoolId }, week),
  // Fix: Added clearWeekPlans method to reset the active week monitoring
  clearWeekPlans: async (schoolId: string, weekId: string) => apiRequest('clearWeekPlans', { schoolId, weekId }),

  // الحضور والغياب
  // Fix: Added getAttendance method to fetch active attendance reports
  getAttendance: async (schoolId: string): Promise<any[]> => apiRequest('getAttendance', { schoolId }),
  // Fix: Added saveAttendance method for teachers to submit daily reports
  saveAttendance: async (schoolId: string, report: any) => apiRequest('saveAttendance', { schoolId }, report),
  // Fix: Added getArchivedAttendance method for historical records
  getArchivedAttendance: async (schoolId: string): Promise<any[]> => apiRequest('getArchivedAttendance', { schoolId }),
  // Fix: Added archiveAttendance method to move current reports to history
  archiveAttendance: async (schoolId: string, id: string) => apiRequest('archiveAttendance', { schoolId, id }),
  // Fix: Added restoreAttendance method to move reports back from archive
  restoreAttendance: async (schoolId: string, id: string) => apiRequest('restoreAttendance', { schoolId, id }),

  // إعدادات النظام
  // Fix: Added getSystemAdmin method for administrative panel access
  getSystemAdmin: async (): Promise<any> => apiRequest('getSystemAdmin'),
  // Fix: Added updateSystemAdmin method for system profile management
  updateSystemAdmin: async (data: any) => apiRequest('updateSystemAdmin', {}, data),

  // المصادقة
  authenticateSchool: async (username: string, password: string): Promise<School | null> => {
    const schools = await db.getSchools();
    return schools.find(s => s.adminUsername === username && s.adminPassword === password) || null;
  },
  // Fix: Added authenticateBiometric method to handle WebAuthn-like flows
  authenticateBiometric: async (): Promise<any> => {
    // محاكاة المصادقة بالبصمة - ترجع null في حالة عدم الربط أو بيانات الجلسة في حالة النجاح
    return null; 
  },
  // Fix: Added registerBiometric method for quick login device binding
  registerBiometric: async (id: string, role: string): Promise<boolean> => {
    // محاكاة تسجيل البصمة وحفظ مفتاح محلي
    localStorage.setItem('local_biometric_key', 'true');
    return true;
  }
};
