
import { School, Teacher, Student, Subject } from './types';

// مفاتيح التخزين
const STORAGE_KEYS = {
  SCHOOLS: 'madrasati_schools',
  TEACHERS: 'madrasati_teachers',
  STUDENTS: 'madrasati_students',
  SYSTEM_ADMIN: 'madrasati_sysadmin'
};

// تهيئة مدير النظام الافتراضي إذا لم يوجد
if (!localStorage.getItem(STORAGE_KEYS.SYSTEM_ADMIN)) {
  localStorage.setItem(STORAGE_KEYS.SYSTEM_ADMIN, JSON.stringify({
    username: 'admin',
    password: '123'
  }));
}

export const DAYS = [
  { id: 'sun', label: 'الأحد' },
  { id: 'mon', label: 'الإثنين' },
  { id: 'tue', label: 'الثلاثاء' },
  { id: 'wed', label: 'الأربعاء' },
  { id: 'thu', label: 'الخميس' }
];

export const PERIODS = [1, 2, 3, 4, 5, 6, 7];

// وظائف مساعدة لإدارة البيانات الحقيقية
export const db = {
  getSchools: (): School[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOLS) || '[]'),
  saveSchool: (school: School) => {
    const schools = db.getSchools();
    const index = schools.findIndex(s => s.id === school.id);
    if (index > -1) schools[index] = school;
    else schools.push(school);
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  },
  
  getSystemAdmin: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.SYSTEM_ADMIN) || '{"username":"admin","password":"123"}'),
  updateSystemAdmin: (data: any) => localStorage.setItem(STORAGE_KEYS.SYSTEM_ADMIN, JSON.stringify(data)),

  getTeachers: (schoolId?: string): Teacher[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
    return schoolId ? all.filter((t: any) => t.schoolId === schoolId) : all;
  },
  saveTeacher: (teacher: Teacher & { schoolId: string }) => {
    const teachers = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
    teachers.push(teacher);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }
};

// للواجهات التي لا تزال تتطلب مصفوفة أولية
export const MOCK_SUBJECTS: Subject[] = [
  { id: '1', name: 'لغتي' },
  { id: '2', name: 'علوم' },
  { id: '3', name: 'فنية' },
  { id: '4', name: 'رياضيات' }
];

export const MOCK_SCHOOLS = db.getSchools();
export const MOCK_TEACHERS = db.getTeachers();
export const MOCK_STUDENTS: Student[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
