
import { School, Teacher, Student, Subject, SchoolClass } from './types.ts';

const STORAGE_KEYS = {
  SCHOOLS: 'madrasati_schools',
  TEACHERS: 'madrasati_teachers',
  STUDENTS: 'madrasati_students',
  CLASSES: 'madrasati_classes',
  SCHEDULES: 'madrasati_schedules',
  PLANS: 'madrasati_plans',
  ATTENDANCE: 'madrasati_attendance',
  SYSTEM_ADMIN: 'madrasati_sysadmin',
  SUBJECTS: 'madrasati_subjects'
};

if (!localStorage.getItem(STORAGE_KEYS.SYSTEM_ADMIN)) {
  localStorage.setItem(STORAGE_KEYS.SYSTEM_ADMIN, JSON.stringify({ username: 'admin', password: '123' }));
}

export const DAYS = [
  { id: 'sun', label: 'الأحد' },
  { id: 'mon', label: 'الإثنين' },
  { id: 'tue', label: 'الثلاثاء' },
  { id: 'wed', label: 'الأربعاء' },
  { id: 'thu', label: 'الخميس' }
];

export const PERIODS = [1, 2, 3, 4, 5, 6, 7];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'لغتي' }, { id: '2', name: 'علوم' }, { id: '3', name: 'فنية' },
  { id: '4', name: 'رياضيات' }, { id: '5', name: 'تربية إسلامية' }, { id: '6', name: 'انجليزي' }
];

export const db = {
  getSchools: (): School[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOLS) || '[]'),
  saveSchool: (school: School) => {
    const schools = db.getSchools();
    const index = schools.findIndex(s => s.id === school.id);
    if (index > -1) schools[index] = school;
    else schools.push(school);
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  },
  getSchoolBySlug: (slug: string) => db.getSchools().find(s => s.slug === slug),

  getSystemAdmin: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.SYSTEM_ADMIN) || '{"username":"admin","password":"123"}'),
  updateSystemAdmin: (data: any) => localStorage.setItem(STORAGE_KEYS.SYSTEM_ADMIN, JSON.stringify(data)),

  getTeachers: (schoolId: string): Teacher[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
    return all.filter((t: any) => t.schoolId === schoolId);
  },
  saveTeacher: (teacher: Teacher) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
    const index = all.findIndex((t: any) => t.id === teacher.id);
    if (index > -1) all[index] = teacher;
    else all.push(teacher);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(all));
  },
  deleteTeacher: (id: string) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(all.filter((t: any) => t.id !== id)));
  },

  getStudents: (schoolId: string): Student[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    return all.filter((s: any) => s.schoolId === schoolId);
  },
  saveStudent: (student: Student & { schoolId: string }) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    all.push(student);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(all));
  },

  // إدارة الفصول
  getClasses: (schoolId: string): SchoolClass[] => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]');
    const schoolClasses = all.filter((c: any) => c.schoolId === schoolId);
    
    // إذا لم توجد فصول معرفة، نحاول استخراجها من الطلاب (للتوافق مع البيانات القديمة)
    if (schoolClasses.length === 0) {
      const students = db.getStudents(schoolId);
      const uniqueClasses = Array.from(new Set(students.map(s => `${s.grade}|${s.section}`)));
      return uniqueClasses.map(str => {
        const [grade, section] = str.split('|');
        return { id: Math.random().toString(36).substr(2, 9), grade, section, schoolId };
      });
    }
    return schoolClasses;
  },
  saveClass: (schoolClass: SchoolClass) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]');
    const index = all.findIndex((c: any) => c.id === schoolClass.id);
    if (index > -1) all[index] = schoolClass;
    else all.push(schoolClass);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(all));
  },
  deleteClass: (id: string) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]');
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(all.filter((c: any) => c.id !== id)));
  },

  getSubjects: (schoolId: string): Subject[] => {
    const all = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.SUBJECTS}_${schoolId}`) || '[]');
    return all.length > 0 ? all : DEFAULT_SUBJECTS;
  },
  saveSubject: (schoolId: string, subject: Subject) => {
    const all = db.getSubjects(schoolId);
    const index = all.findIndex(s => s.id === subject.id);
    if (index > -1) all[index] = subject;
    else all.push(subject);
    localStorage.setItem(`${STORAGE_KEYS.SUBJECTS}_${schoolId}`, JSON.stringify(all));
  },
  deleteSubject: (schoolId: string, subjectId: string) => {
    const all = db.getSubjects(schoolId);
    const filtered = all.filter(s => s.id !== subjectId);
    localStorage.setItem(`${STORAGE_KEYS.SUBJECTS}_${schoolId}`, JSON.stringify(filtered));
  },

  getSchedule: (schoolId: string, classId: string) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULES) || '{}');
    return all[`${schoolId}_${classId}`] || {};
  },
  saveSchedule: (schoolId: string, classId: string, schedule: any) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULES) || '{}');
    all[`${schoolId}_${classId}`] = schedule;
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(all));
  },

  getPlans: (schoolId: string) => JSON.parse(localStorage.getItem(`${STORAGE_KEYS.PLANS}_${schoolId}`) || '{}'),
  savePlan: (schoolId: string, planKey: string, data: any) => {
    const plans = db.getPlans(schoolId);
    plans[planKey] = data;
    localStorage.setItem(`${STORAGE_KEYS.PLANS}_${schoolId}`, JSON.stringify(plans));
  },

  getAttendance: (schoolId: string) => JSON.parse(localStorage.getItem(`${STORAGE_KEYS.ATTENDANCE}_${schoolId}`) || '[]'),
  saveAttendance: (schoolId: string, report: any) => {
    const all = db.getAttendance(schoolId);
    all.unshift(report);
    localStorage.setItem(`${STORAGE_KEYS.ATTENDANCE}_${schoolId}`, JSON.stringify(all));
  }
};

export const MOCK_SUBJECTS = DEFAULT_SUBJECTS;
