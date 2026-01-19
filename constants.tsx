
import { ApiResponse, User, SystemStats, School, Student, SchoolClass, Teacher, Subject, AcademicWeek } from './types';

// الحصول على رابط الـ API بشكل ديناميكي
export const getApiUrl = () => {
  const origin = window.location.origin;
  // في الـ Production يكون المسار هو api.php مباشرة في الـ public folder
  return `${origin}/api`;
};

// أيام الأسبوع
export const DAYS = [
  { id: 'sun', label: 'الأحد' },
  { id: 'mon', label: 'الأثنين' },
  { id: 'tue', label: 'الثلاثاء' },
  { id: 'wed', label: 'الأربعاء' },
  { id: 'thu', label: 'الخميس' },
];

// حصص اليوم
export const PERIODS = [1, 2, 3, 4, 5, 6, 7];

// تنسيق التاريخ للهجري
export const formatToHijri = (dateStr: string | Date) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// تشفير كلمة المرور (بسيط للعرض)
export const hashSecurityPassword = async (password: string) => {
  return btoa(password);
};

export const apiCall = async <T = any>(
  action: string, 
  body: any = null, 
  params: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  try {
    const queryParams = new URLSearchParams({ action, ...params }).toString();
    const url = `${getApiUrl()}?${queryParams}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : JSON.stringify({}),
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'خطأ في الاتصال بالسيرفر' 
    };
  }
};

export const db = {
  adminLogin: (credentials: any) => apiCall<User>('admin_login', credentials),
  // دالة الدخول للمدارس
  authenticateSchool: (credentials: any) => apiCall<User>('school_login', credentials),
  // محاكاة التحقق من البصمة (يمكن ربطها بـ WebAuthn لاحقاً)
  authenticateBiometric: async (): Promise<ApiResponse<User>> => {
    const savedBio = localStorage.getItem('khotati_bio_data');
    if (!savedBio) return { success: false, error: 'لا توجد بصمة مسجلة لهذا الجهاز' };
    return apiCall<User>('school_login', JSON.parse(savedBio));
  },
  getSystemStats: () => apiCall<SystemStats>('get_system_stats'),
  getAllSchools: () => apiCall<School[]>('get_all_schools'),
  importStudents: (data: { students: any[], schoolId: string }) => apiCall('import_students', data),
  
  // دوال الطلاب
  getStudents: async (schoolId: string) => {
    const res = await apiCall<Student[]>('getStudents', null, { schoolId });
    return res.data || [];
  },
  saveBulkStudents: (students: Student[]) => apiCall('saveBulkStudents', students),
  deleteAllStudents: (schoolId: string) => apiCall('deleteAllStudents', null, { schoolId }),
  
  // دوال الفصول والمعلمين والمواد
  getClasses: async (schoolId: string) => {
    const res = await apiCall<SchoolClass[]>('getClasses', null, { schoolId });
    return res.data || [];
  },
  getTeachers: async (schoolId: string) => {
    const res = await apiCall<Teacher[]>('getTeachers', null, { schoolId });
    return res.data || [];
  },
  getSubjects: async (schoolId: string) => {
    const res = await apiCall<Subject[]>('getSubjects', null, { schoolId });
    return res.data || [];
  },
  
  // دوال الجداول
  getSchedule: async (schoolId: string, classTitle: string) => {
    const res = await apiCall<any>('getSchedule', null, { schoolId, classTitle });
    return res.data || {};
  },
  saveSchedule: (schoolId: string, classTitle: string, schedule: any) => apiCall('saveSchedule', schedule, { schoolId, classTitle }),
  
  // دوال الحفظ والحذف للإعدادات
  saveTeacher: (teacher: Teacher) => apiCall('saveTeacher', teacher),
  deleteTeacher: (id: string) => apiCall('deleteTeacher', null, { id }),
  saveClass: (classData: SchoolClass) => apiCall('saveClass', classData),
  deleteClass: (schoolId: string, classId: string) => apiCall('deleteClass', null, { schoolId, classId }),
  syncClassesFromStudents: (schoolId: string) => apiCall('syncClassesFromStudents', null, { schoolId }),
  saveSubject: (schoolId: string, subject: Subject) => apiCall('saveSubject', subject, { schoolId }),
  deleteSubject: (schoolId: string, subjectId: string) => apiCall('deleteSubject', null, { schoolId, subjectId }),
  
  // دوال الخطط والأسابيع
  getActiveWeek: async (schoolId: string): Promise<AcademicWeek | undefined> => {
    const res = await apiCall<AcademicWeek[]>('getWeeks', null, { schoolId });
    return res.data?.find(w => w.isActive);
  },
  getPlans: async (schoolId: string, weekId: string) => {
    const res = await apiCall<any>('getPlans', null, { schoolId, weekId });
    return res.data || {};
  },
  savePlan: (schoolId: string, weekId: string, planKey: string, updatedEntry: any) => 
    apiCall('savePlan', { ...updatedEntry, schoolId, weekId, planKey }),
  
  // دوال الحضور
  saveAttendance: (schoolId: string, report: any) => apiCall('saveAttendance', { ...report, schoolId }),
  getAttendance: async (schoolId: string) => {
    const res = await apiCall<any[]>('getAttendance', null, { schoolId });
    return res.data || [];
  },
  getArchivedAttendance: async (schoolId: string) => {
    const res = await apiCall<any[]>('getArchivedAttendance', null, { schoolId });
    return res.data || [];
  },
  archiveAttendance: (schoolId: string, id: string) => apiCall('archiveAttendance', null, { schoolId, id }),
  restoreAttendance: (schoolId: string, id: string) => apiCall('restoreAttendance', null, { schoolId, id }),
  
  // دوال المدرسة والأسابيع والأرشفة
  getSchoolBySlug: async (schoolSlug: string) => {
    const res = await apiCall<School>('getSchoolBySlug', null, { slug: schoolSlug });
    return res.data || null;
  },
  getWeeks: async (schoolId: string) => {
    const res = await apiCall<AcademicWeek[]>('getWeeks', null, { schoolId });
    return res.data || [];
  },
  getArchivedPlans: async (schoolId: string) => {
    const res = await apiCall<any[]>('getArchivedPlans', null, { schoolId });
    return res.data || [];
  },
  saveSchool: (school: School) => apiCall('saveSchool', school),
  archiveWeekPlans: (schoolId: string, week: AcademicWeek) => apiCall('archiveWeekPlans', week, { schoolId }),
  clearWeekPlans: (schoolId: string, weekId: string) => apiCall('clearWeekPlans', null, { schoolId, weekId }),
  saveWeek: (schoolId: string, week: AcademicWeek) => apiCall('saveWeek', week, { schoolId }),
  setActiveWeek: (schoolId: string, weekId: string) => apiCall('setActiveWeek', null, { schoolId, weekId }),
  deleteWeek: (schoolId: string, weekId: string) => apiCall('deleteWeek', null, { schoolId, weekId }),
  
  // البصمة
  registerBiometric: async (schoolId: string, role: string) => true,
};
