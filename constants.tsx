
import { ApiResponse, School, Student, Teacher, Subject, SchoolClass, AcademicWeek } from './types';

// تحديد مسار الـ API النسبي ليعمل على أي استضافة
const API_URL = '/api';

export const DAYS = [
  { id: 'sun', label: 'الأحد' },
  { id: 'mon', label: 'الاثنين' },
  { id: 'tue', label: 'الثلاثاء' },
  { id: 'wed', label: 'الأربعاء' },
  { id: 'thu', label: 'الخميس' },
];

export const PERIODS = [1, 2, 3, 4, 5, 6, 7];

export const formatToHijri = (dateStr: string | Date) => {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const hashSecurityPassword = async (password: string) => {
  return btoa(password);
};

export const apiCall = async <T = any>(action: string, body: any = null, params: Record<string, string> = {}): Promise<ApiResponse<T>> => {
  try {
    const urlParams = new URLSearchParams({ action, ...params });
    const response = await fetch(`${API_URL}?${urlParams.toString()}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null,
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const result = await response.json();
    // Wrap raw arrays in ApiResponse for consistency if needed, but here unwrap handles it
    return result;
  } catch (error: any) {
    return { success: false, error: error.message || 'خطأ في الاتصال بالسيرفر' };
  }
};

const unwrap = <T>(res: any): T => {
  if (!res) throw new Error('No response from server');
  if (Array.isArray(res)) return res as unknown as T;
  if (res.success === false) throw new Error(res.error || 'API Error');
  return res.data !== undefined ? res.data : res;
};

export const db = {
  adminLogin: (credentials: any) => apiCall('adminLogin', credentials),
  getSystemStats: () => apiCall('getSystemStats'),
  getAllSchools: () => apiCall('getSchools'),
  getSchoolBySlug: async (slug: string) => {
    const res = await apiCall<School>('getSchoolBySlug', null, { slug });
    return unwrap<School>(res);
  },
  saveSchool: (school: School) => apiCall('saveSchool', school),
  authenticateSchool: async (username: string, password: string) => {
    const res = await apiCall<School[]>('getSchools');
    const schools = unwrap<School[]>(res);
    return schools.find(s => s.adminUsername === username && s.adminPassword === password) || null;
  },
  authenticateBiometric: async () => {
    // Biometric mock authentication
    const key = localStorage.getItem('local_biometric_key');
    if (!key) return null;
    return null; 
  },
  registerBiometric: async (id: string, type: string) => {
    localStorage.setItem('local_biometric_key', `${type}_${id}`);
    return true;
  },
  getStudents: async (schoolId: string) => unwrap<Student[]>(await apiCall('getStudents', null, { schoolId })),
  saveBulkStudents: (students: Student[]) => apiCall('saveBulkStudents', students),
  deleteAllStudents: (schoolId: string) => apiCall('deleteAllStudents', null, { schoolId }),
  importStudents: (data: any) => apiCall('importStudents', data),
  getTeachers: async (schoolId: string) => unwrap<Teacher[]>(await apiCall('getTeachers', null, { schoolId })),
  saveTeacher: (teacher: Teacher) => apiCall('saveTeacher', teacher),
  deleteTeacher: (id: string) => apiCall('deleteTeacher', null, { id }),
  getSubjects: async (schoolId: string) => unwrap<Subject[]>(await apiCall('getSubjects', null, { schoolId })),
  saveSubject: (schoolId: string, subject: Subject) => apiCall('saveSubject', subject, { schoolId }),
  deleteSubject: (schoolId: string, subjectId: string) => apiCall('deleteSubject', null, { schoolId, subjectId }),
  getClasses: async (schoolId: string) => unwrap<SchoolClass[]>(await apiCall('getClasses', null, { schoolId })),
  saveClass: (classData: SchoolClass) => apiCall('saveClass', classData),
  deleteClass: (schoolId: string, classId: string) => apiCall('deleteClass', null, { schoolId, classId }),
  syncClassesFromStudents: (schoolId: string) => apiCall('syncClassesFromStudents', null, { schoolId }),
  getSchedule: async (schoolId: string, classTitle: string) => unwrap<any>(await apiCall('getSchedule', null, { schoolId, classTitle })),
  saveSchedule: (schoolId: string, classTitle: string, schedule: any) => apiCall('saveSchedule', schedule, { schoolId, classTitle }),
  getWeeks: async (schoolId: string) => unwrap<AcademicWeek[]>(await apiCall('getWeeks', null, { schoolId })),
  getActiveWeek: async (schoolId: string) => {
    const weeks = await db.getWeeks(schoolId);
    return weeks.find(w => w.isActive);
  },
  saveWeek: (schoolId: string, week: AcademicWeek) => apiCall('saveWeek', week, { schoolId }),
  setActiveWeek: (schoolId: string, weekId: string) => apiCall('setActiveWeek', null, { schoolId, weekId }),
  deleteWeek: (schoolId: string, weekId: string) => apiCall('deleteWeek', null, { schoolId, weekId }),
  getPlans: async (schoolId: string, weekId: string) => unwrap<any>(await apiCall('getPlans', null, { schoolId, weekId })),
  savePlan: (schoolId: string, weekId: string, planKey: string, entry: any) => apiCall('savePlan', { schoolId, weekId, planKey, ...entry }),
  clearWeekPlans: (schoolId: string, weekId: string) => apiCall('clearWeekPlans', null, { schoolId, weekId }),
  archiveWeekPlans: (schoolId: string, week: AcademicWeek) => apiCall('archiveWeekPlans', week, { schoolId }),
  getArchivedPlans: async (schoolId: string) => unwrap<any[]>(await apiCall('getArchivedPlans', null, { schoolId })),
  getAttendance: async (schoolId: string) => unwrap<any[]>(await apiCall('getAttendance', null, { schoolId })),
  getArchivedAttendance: async (schoolId: string) => unwrap<any[]>(await apiCall('getArchivedAttendance', null, { schoolId })),
  saveAttendance: (schoolId: string, report: any) => apiCall('saveAttendance', { schoolId, ...report }),
  archiveAttendance: (schoolId: string, id: string) => apiCall('archiveAttendance', null, { schoolId, id }),
  restoreAttendance: (schoolId: string, id: string) => apiCall('restoreAttendance', null, { schoolId, id }),
};
