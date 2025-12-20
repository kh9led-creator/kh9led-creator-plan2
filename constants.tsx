
import { Student, School, SchoolClass, Subject, Teacher, AcademicWeek } from './types.ts';

// Security utilities for handling sensitive data in localStorage
export const Security = {
  encrypt: (data: any) => btoa(encodeURIComponent(JSON.stringify(data))),
  decrypt: (data: string) => {
    try {
      if (!data) return null;
      return JSON.parse(decodeURIComponent(atob(data)));
    } catch (e) {
      console.error("Decryption error", e);
      return null;
    }
  }
};

export const STORAGE_KEYS = {
  SCHOOLS: 'madrasati_schools_secure',
  TEACHERS: 'madrasati_teachers_secure',
  STUDENTS: 'madrasati_students_secure',
  CLASSES: 'madrasati_classes_secure',
  SUBJECTS: 'madrasati_subjects_secure',
  SCHEDULE: 'madrasati_schedule_secure',
  PLANS: 'madrasati_plans_secure',
  ATTENDANCE: 'madrasati_attendance_secure',
  WEEKS: 'madrasati_weeks_secure',
  ARCHIVED_PLANS: 'madrasati_archived_plans_secure',
  ARCHIVED_ATTENDANCE: 'madrasati_archived_attendance_secure',
  SYSTEM_ADMIN: 'madrasati_sysadmin_secure',
  BIOMETRIC: 'local_biometric_key'
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

export const hashSecurityPassword = async (password: string) => password; // Simplified for demo purposes

const getFromStorage = (key: string) => Security.decrypt(localStorage.getItem(key) || "");
const saveToStorage = (key: string, data: any) => localStorage.setItem(key, Security.encrypt(data));

export const db = {
  getSchools: async (): Promise<School[]> => getFromStorage(STORAGE_KEYS.SCHOOLS) || [],
  getSchoolBySlug: async (slug: string): Promise<School | undefined> => {
    const schools = await db.getSchools();
    return schools.find(s => s.slug === slug);
  },
  saveSchool: async (school: School) => {
    const schools = await db.getSchools();
    const index = schools.findIndex(s => s.id === school.id);
    if (index > -1) schools[index] = school;
    else schools.push(school);
    saveToStorage(STORAGE_KEYS.SCHOOLS, schools);
  },
  deleteSchool: async (id: string) => {
    const schools = await db.getSchools();
    saveToStorage(STORAGE_KEYS.SCHOOLS, schools.filter(s => s.id !== id));
  },
  authenticateSchool: async (username: string, password: string): Promise<School | null> => {
    const schools = await db.getSchools();
    return schools.find(s => s.adminUsername === username && s.adminPassword === password) || null;
  },
  
  getTeachers: async (schoolId: string): Promise<Teacher[]> => {
    const all = getFromStorage(STORAGE_KEYS.TEACHERS) || [];
    return all.filter((t: Teacher) => t.schoolId === schoolId);
  },
  saveTeacher: async (teacher: Teacher) => {
    const all = getFromStorage(STORAGE_KEYS.TEACHERS) || [];
    const index = all.findIndex((t: Teacher) => t.id === teacher.id);
    if (index > -1) all[index] = teacher;
    else all.push(teacher);
    saveToStorage(STORAGE_KEYS.TEACHERS, all);
  },
  deleteTeacher: async (id: string) => {
    const all = getFromStorage(STORAGE_KEYS.TEACHERS) || [];
    saveToStorage(STORAGE_KEYS.TEACHERS, all.filter((t: Teacher) => t.id !== id));
  },

  getStudents: async (schoolId: string): Promise<Student[]> => {
    const all = getFromStorage(STORAGE_KEYS.STUDENTS) || [];
    return all.filter((s: Student) => s.schoolId === schoolId);
  },
  saveBulkStudents: async (students: Student[]) => {
    const all = getFromStorage(STORAGE_KEYS.STUDENTS) || [];
    const others = all.filter((s: Student) => s.schoolId !== (students[0]?.schoolId));
    saveToStorage(STORAGE_KEYS.STUDENTS, [...others, ...students]);
    if (students.length > 0) {
      await db.syncClassesFromStudents(students[0].schoolId, students);
    }
  },
  deleteAllStudents: async (schoolId: string) => {
    const all = getFromStorage(STORAGE_KEYS.STUDENTS) || [];
    saveToStorage(STORAGE_KEYS.STUDENTS, all.filter((s: Student) => s.schoolId !== schoolId));
    const allClasses = getFromStorage(STORAGE_KEYS.CLASSES) || [];
    saveToStorage(STORAGE_KEYS.CLASSES, allClasses.filter((c: SchoolClass) => c.schoolId !== schoolId));
  },

  getClasses: async (schoolId: string): Promise<SchoolClass[]> => {
    const all = getFromStorage(STORAGE_KEYS.CLASSES) || [];
    return all.filter((c: SchoolClass) => c.schoolId === schoolId);
  },
  saveClass: async (classData: SchoolClass) => {
    const all = getFromStorage(STORAGE_KEYS.CLASSES) || [];
    const index = all.findIndex((c: SchoolClass) => c.id === classData.id);
    if (index > -1) all[index] = classData;
    else all.push(classData);
    saveToStorage(STORAGE_KEYS.CLASSES, all);
  },
  deleteClass: async (schoolId: string, id: string) => {
    const all = getFromStorage(STORAGE_KEYS.CLASSES) || [];
    saveToStorage(STORAGE_KEYS.CLASSES, all.filter((c: SchoolClass) => c.schoolId !== schoolId || c.id !== id));
  },
  syncClassesFromStudents: async (schoolId: string, providedStudents?: Student[]) => {
    const students = providedStudents || await db.getStudents(schoolId);
    const uniqueClassKeys = Array.from(new Set(
      students
        .filter(s => {
          const g = s.grade.trim();
          const n = s.name.trim();
          const isPhone = /[0-9]{8,}/.test(g);
          return g.length > 0 && !isPhone && g !== n;
        })
        .map(s => `${s.grade.trim()}::${s.section.trim()}`)
    ));

    const allData: SchoolClass[] = getFromStorage(STORAGE_KEYS.CLASSES) || [];
    const otherSchoolsClasses = allData.filter((c: SchoolClass) => c.schoolId !== schoolId);
    
    const newClassesForSchool = uniqueClassKeys.map((uc: string) => {
      const [grade, section] = uc.split('::');
      return { 
        id: `cls-${schoolId}-${grade}-${section}-${Date.now()}`,
        grade, 
        section, 
        schoolId 
      };
    });

    saveToStorage(STORAGE_KEYS.CLASSES, [...otherSchoolsClasses, ...newClassesForSchool]);
  },

  getSubjects: async (schoolId: string): Promise<Subject[]> => {
    const all = getFromStorage(STORAGE_KEYS.SUBJECTS) || {};
    return all[schoolId] || [];
  },
  saveSubject: async (schoolId: string, subject: Subject) => {
    const all = getFromStorage(STORAGE_KEYS.SUBJECTS) || {};
    if (!all[schoolId]) all[schoolId] = [];
    all[schoolId].push(subject);
    saveToStorage(STORAGE_KEYS.SUBJECTS, all);
  },
  deleteSubject: async (schoolId: string, id: string) => {
    const all = getFromStorage(STORAGE_KEYS.SUBJECTS) || {};
    if (all[schoolId]) {
      all[schoolId] = all[schoolId].filter((s: Subject) => s.id !== id);
      saveToStorage(STORAGE_KEYS.SUBJECTS, all);
    }
  },

  getSchedule: async (schoolId: string, classTitle: string): Promise<any> => {
    const all = getFromStorage(STORAGE_KEYS.SCHEDULE) || {};
    return all[`${schoolId}_${classTitle}`] || {};
  },
  saveSchedule: async (schoolId: string, classTitle: string, schedule: any) => {
    const all = getFromStorage(STORAGE_KEYS.SCHEDULE) || {};
    all[`${schoolId}_${classTitle}`] = schedule;
    saveToStorage(STORAGE_KEYS.SCHEDULE, all);
  },

  getWeeks: async (schoolId: string): Promise<AcademicWeek[]> => {
    const all = getFromStorage(STORAGE_KEYS.WEEKS) || {};
    return all[schoolId] || [];
  },
  getActiveWeek: async (schoolId: string): Promise<AcademicWeek | undefined> => {
    const weeks = await db.getWeeks(schoolId);
    return weeks.find(w => w.isActive);
  },
  saveWeek: async (schoolId: string, week: AcademicWeek) => {
    const all = getFromStorage(STORAGE_KEYS.WEEKS) || {};
    if (!all[schoolId]) all[schoolId] = [];
    all[schoolId].push(week);
    saveToStorage(STORAGE_KEYS.WEEKS, all);
  },
  setActiveWeek: async (schoolId: string, id: string) => {
    const all = getFromStorage(STORAGE_KEYS.WEEKS) || {};
    if (all[schoolId]) {
      all[schoolId] = all[schoolId].map((w: AcademicWeek) => ({ ...w, isActive: w.id === id }));
      saveToStorage(STORAGE_KEYS.WEEKS, all);
    }
  },
  deleteWeek: async (schoolId: string, id: string) => {
    const all = getFromStorage(STORAGE_KEYS.WEEKS) || {};
    if (all[schoolId]) {
      all[schoolId] = all[schoolId].filter((w: AcademicWeek) => w.id !== id);
      saveToStorage(STORAGE_KEYS.WEEKS, all);
    }
  },

  getPlans: async (schoolId: string, weekId: string): Promise<any> => {
    const all = getFromStorage(STORAGE_KEYS.PLANS) || {};
    return all[`${schoolId}_${weekId}`] || {};
  },
  savePlan: async (schoolId: string, weekId: string, planKey: string, entry: any) => {
    const all = getFromStorage(STORAGE_KEYS.PLANS) || {};
    const weekPlans = all[`${schoolId}_${weekId}`] || {};
    weekPlans[planKey] = entry;
    all[`${schoolId}_${weekId}`] = weekPlans;
    saveToStorage(STORAGE_KEYS.PLANS, all);
  },
  clearWeekPlans: async (schoolId: string, weekId: string) => {
    const all = getFromStorage(STORAGE_KEYS.PLANS) || {};
    delete all[`${schoolId}_${weekId}`];
    saveToStorage(STORAGE_KEYS.PLANS, all);
  },
  archiveWeekPlans: async (schoolId: string, week: AcademicWeek) => {
    const plans = await db.getPlans(schoolId, week.id);
    const archives = getFromStorage(STORAGE_KEYS.ARCHIVED_PLANS) || {};
    if (!archives[schoolId]) archives[schoolId] = [];
    archives[schoolId].push({
      id: Date.now().toString(),
      weekId: week.id,
      weekName: week.name,
      startDate: week.startDate,
      endDate: week.endDate,
      plans
    });
    saveToStorage(STORAGE_KEYS.ARCHIVED_PLANS, archives);
  },
  getArchivedPlans: async (schoolId: string): Promise<any[]> => {
    const all = getFromStorage(STORAGE_KEYS.ARCHIVED_PLANS) || {};
    return all[schoolId] || [];
  },

  getAttendance: async (schoolId: string): Promise<any[]> => {
    const all = getFromStorage(STORAGE_KEYS.ATTENDANCE) || {};
    return all[schoolId] || [];
  },
  saveAttendance: async (schoolId: string, report: any) => {
    const all = getFromStorage(STORAGE_KEYS.ATTENDANCE) || {};
    if (!all[schoolId]) all[schoolId] = [];
    all[schoolId].push(report);
    saveToStorage(STORAGE_KEYS.ATTENDANCE, all);
  },
  archiveAttendance: async (schoolId: string, id: string) => {
    const all = getFromStorage(STORAGE_KEYS.ATTENDANCE) || {};
    const report = all[schoolId]?.find((r: any) => r.id === id);
    if (report) {
      all[schoolId] = all[schoolId].filter((r: any) => r.id !== id);
      const archives = getFromStorage(STORAGE_KEYS.ARCHIVED_ATTENDANCE) || {};
      if (!archives[schoolId]) archives[schoolId] = [];
      archives[schoolId].push(report);
      saveToStorage(STORAGE_KEYS.ATTENDANCE, all);
      saveToStorage(STORAGE_KEYS.ARCHIVED_ATTENDANCE, archives);
    }
  },
  getArchivedAttendance: async (schoolId: string): Promise<any[]> => {
    const all = getFromStorage(STORAGE_KEYS.ARCHIVED_ATTENDANCE) || {};
    return all[schoolId] || [];
  },
  restoreAttendance: async (schoolId: string, id: string) => {
    const archives = getFromStorage(STORAGE_KEYS.ARCHIVED_ATTENDANCE) || {};
    const report = archives[schoolId]?.find((r: any) => r.id === id);
    if (report) {
      archives[schoolId] = archives[schoolId].filter((r: any) => r.id !== id);
      const all = getFromStorage(STORAGE_KEYS.ATTENDANCE) || {};
      if (!all[schoolId]) all[schoolId] = [];
      all[schoolId].push(report);
      saveToStorage(STORAGE_KEYS.ATTENDANCE, all);
      saveToStorage(STORAGE_KEYS.ARCHIVED_ATTENDANCE, archives);
    }
  },

  getSystemAdmin: async () => getFromStorage(STORAGE_KEYS.SYSTEM_ADMIN) || { username: 'admin', password: '123' },
  updateSystemAdmin: async (updated: any) => saveToStorage(STORAGE_KEYS.SYSTEM_ADMIN, updated),

  registerBiometric: async (id: string, type: 'SCHOOL' | 'TEACHER') => {
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC, Security.encrypt({ id, type }));
    return true;
  },
  authenticateBiometric: async () => {
    const key = localStorage.getItem(STORAGE_KEYS.BIOMETRIC);
    if (!key) return null;
    const decrypted = Security.decrypt(key);
    if (!decrypted) return null;
    const { id, type } = decrypted;
    if (type === 'SCHOOL') {
      const schools = await db.getSchools();
      const school = schools.find((s: School) => s.id === id);
      return school ? { type: 'SCHOOL_ADMIN', data: school } : null;
    } else {
      const allTeachers = getFromStorage(STORAGE_KEYS.TEACHERS) || [];
      const teacher = allTeachers.find((t: Teacher) => t.id === id);
      return teacher ? { type: 'TEACHER', data: teacher } : null;
    }
  }
};
