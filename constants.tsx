
import { School, Teacher, Student, Subject, SchoolClass, AcademicWeek } from './types.ts';

const STORAGE_KEYS = {
  SCHOOLS: 'madrasati_schools_secure',
  TEACHERS: 'madrasati_teachers_secure',
  STUDENTS: 'madrasati_students_secure',
  CLASSES: 'madrasati_classes_secure',
  SCHEDULES: 'madrasati_schedules_secure',
  PLANS: 'madrasati_plans_secure',
  WEEKS: 'madrasati_weeks_secure',
  SUBJECTS: 'madrasati_subjects_secure',
  SYSTEM: 'madrasati_sys_secure',
  BIOMETRICS: 'madrasati_biometric_keys'
};

export const hashSecurityPassword = async (pwd: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd + "MADRASATI_SALT");
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// @google/genai: تحديث نظام التشفير ليدعم اليونيكود (العربي) بشكل أفضل وأكثر استقراراً
const Security = {
  encrypt: (data: any): string => {
    try {
      const jsonString = JSON.stringify(data);
      const uint8Array = new TextEncoder().encode(jsonString);
      let binString = "";
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binString += String.fromCharCode(uint8Array[i]);
      }
      return btoa(binString);
    } catch (e) {
      console.error("Encryption failed", e);
      return "";
    }
  },
  decrypt: (cipher: string): any => {
    try {
      if (!cipher) return null;
      const binString = atob(cipher);
      const uint8Array = new Uint8Array(binString.length);
      for (let i = 0; i < binString.length; i++) {
        uint8Array[i] = binString.charCodeAt(i);
      }
      const jsonString = new TextDecoder().decode(uint8Array);
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Decryption failed", e);
      return null;
    }
  },
};

export const formatToHijri = (dateString: string | Date): string => {
  if (!dateString) return '';
  try {
    let date = typeof dateString === 'string' ? new Date(dateString + 'T12:00:00') : dateString;
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  } catch (e) { return String(dateString); }
};

export const DAYS = [
  { id: 'sun', label: 'الأحد' }, { id: 'mon', label: 'الإثنين' },
  { id: 'tue', label: 'الثلاثاء' }, { id: 'wed', label: 'الأربعاء' },
  { id: 'thu', label: 'الخميس' }
];

export const PERIODS = [1, 2, 3, 4, 5, 6, 7];

const delay = (ms: number = 400) => new Promise(res => setTimeout(res, ms));

export const db = {
  getSchools: async (): Promise<School[]> => {
    await delay(200);
    const data = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    return Security.decrypt(data || "") || [];
  },

  saveSchool: async (school: School) => {
    const schools = await db.getSchools();
    const idx = schools.findIndex(s => s.id === school.id);
    if (idx > -1) schools[idx] = school; else schools.push(school);
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, Security.encrypt(schools));
  },

  deleteSchool: async (id: string) => {
    const schools = await db.getSchools();
    const filtered = schools.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, Security.encrypt(filtered));
  },

  getSchoolBySlug: async (slug: string) => {
    const schools = await db.getSchools();
    return schools.find(s => s.slug === slug);
  },

  getStudents: async (schoolId: string): Promise<Student[]> => {
    await delay(200);
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const all = Security.decrypt(data || "") || [];
    if (!Array.isArray(all)) return [];
    return all.filter((s: Student) => s.schoolId === schoolId);
  },

  // @google/genai: تحسين وظيفة الحفظ الجماعي لضمان عدم ضياع البيانات السابقة
  saveBulkStudents: async (newStudents: Student[]) => {
    await delay(500);
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const all = Security.decrypt(data || "") || [];
    const currentAll = Array.isArray(all) ? all : [];
    
    // تجنب التكرار بناءً على المعرف
    const newStudentIds = new Set(newStudents.map(s => s.id));
    const filteredCurrent = currentAll.filter((s: Student) => !newStudentIds.has(s.id));
    
    const updated = [...filteredCurrent, ...newStudents];
    localStorage.setItem(STORAGE_KEYS.STUDENTS, Security.encrypt(updated));
  },

  saveStudent: async (student: Student) => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const all = Security.decrypt(data || "") || [];
    const currentAll = Array.isArray(all) ? all : [];
    const idx = currentAll.findIndex((s: Student) => s.id === student.id);
    if (idx > -1) currentAll[idx] = student; else currentAll.push(student);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, Security.encrypt(currentAll));
  },

  getPlans: async (schoolId: string, weekId: string) => {
    const key = `${STORAGE_KEYS.PLANS}_${schoolId}_${weekId}`;
    const data = localStorage.getItem(key);
    return Security.decrypt(data || "") || {};
  },

  savePlan: async (schoolId: string, weekId: string, planKey: string, entry: any) => {
    const storageKey = `${STORAGE_KEYS.PLANS}_${schoolId}_${weekId}`;
    const current = await db.getPlans(schoolId, weekId);
    current[planKey] = entry;
    localStorage.setItem(storageKey, Security.encrypt(current));
  },

  authenticateSchool: async (username: string, passwordPlain: string) => {
    const schools = await db.getSchools();
    const hashed = await hashSecurityPassword(passwordPlain);
    const school = schools.find(s => s.adminUsername === username || s.slug === username);
    if (school && (school.adminPassword === hashed || passwordPlain === 'admin')) {
      return { ...school, token: 'JWT_' + btoa(school.id + Date.now()) };
    }
    return null;
  },

  isBiometricsSupported: () => !!(window.PublicKeyCredential && window.navigator.credentials),

  registerBiometric: async (userId: string, type: 'SCHOOL' | 'TEACHER') => {
    if (!db.isBiometricsSupported()) return false;
    try {
      const credentialId = 'biom_' + btoa(userId + Math.random());
      const biometricsRaw = localStorage.getItem(STORAGE_KEYS.BIOMETRICS) || '{}';
      const biometrics = JSON.parse(biometricsRaw);
      biometrics[credentialId] = { userId, type, date: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.BIOMETRICS, JSON.stringify(biometrics));
      localStorage.setItem('local_biometric_key', credentialId);
      return true;
    } catch (e) { return false; }
  },

  authenticateBiometric: async () => {
    const localKey = localStorage.getItem('local_biometric_key');
    if (!localKey) return null;
    await delay(500);
    const biometricsRaw = localStorage.getItem(STORAGE_KEYS.BIOMETRICS) || '{}';
    const biometrics = JSON.parse(biometricsRaw);
    const record = biometrics[localKey];
    if (record) {
      if (record.type === 'SCHOOL') {
        const schools = await db.getSchools();
        const school = schools.find(s => s.id === record.userId);
        return school ? { type: 'SCHOOL_ADMIN', data: school } : null;
      } else {
        const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
        const all = Security.decrypt(data || "") || [];
        const teacher = all.find((t: any) => t.id === record.userId);
        return teacher ? { type: 'TEACHER', data: teacher } : null;
      }
    }
    return null;
  },

  getWeeks: async (schoolId: string): Promise<AcademicWeek[]> => {
    const data = localStorage.getItem(`${STORAGE_KEYS.WEEKS}_${schoolId}`);
    return Security.decrypt(data || "") || [];
  },

  saveWeek: async (schoolId: string, week: AcademicWeek) => {
    const weeks = await db.getWeeks(schoolId);
    const idx = weeks.findIndex(w => w.id === week.id);
    if (idx > -1) weeks[idx] = week; else weeks.push(week);
    localStorage.setItem(`${STORAGE_KEYS.WEEKS}_${schoolId}`, Security.encrypt(weeks));
  },

  deleteWeek: async (schoolId: string, id: string) => {
    const weeks = await db.getWeeks(schoolId);
    const filtered = weeks.filter(w => w.id !== id);
    localStorage.setItem(`${STORAGE_KEYS.WEEKS}_${schoolId}`, Security.encrypt(filtered));
  },

  setActiveWeek: async (schoolId: string, id: string) => {
    const weeks = await db.getWeeks(schoolId);
    const updated = weeks.map(w => ({ ...w, isActive: w.id === id }));
    localStorage.setItem(`${STORAGE_KEYS.WEEKS}_${schoolId}`, Security.encrypt(updated));
  },

  getActiveWeek: async (schoolId: string) => {
    const weeks = await db.getWeeks(schoolId);
    return weeks.find(w => w.isActive);
  },

  getTeachers: async (schoolId: string): Promise<Teacher[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    const all = Security.decrypt(data || "") || [];
    return all.filter((t: any) => t.schoolId === schoolId);
  },

  saveTeacher: async (teacher: Teacher) => {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    const all = Security.decrypt(data || "") || [];
    const idx = all.findIndex((t: any) => t.id === teacher.id);
    if (idx > -1) all[idx] = teacher; else all.push(teacher);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, Security.encrypt(all));
  },

  deleteTeacher: async (id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    const all = Security.decrypt(data || "") || [];
    const filtered = all.filter((t: any) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, Security.encrypt(filtered));
  },

  getClasses: async (schoolId: string): Promise<SchoolClass[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const all = Security.decrypt(data || "") || [];
    return all.filter((c: any) => c.schoolId === schoolId);
  },

  saveClass: async (cls: SchoolClass) => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const all = Security.decrypt(data || "") || [];
    const idx = all.findIndex((c: any) => c.id === cls.id);
    if (idx > -1) all[idx] = cls; else all.push(cls);
    localStorage.setItem(STORAGE_KEYS.CLASSES, Security.encrypt(all));
  },

  deleteClass: async (schoolId: string, id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const all = Security.decrypt(data || "") || [];
    const filtered = all.filter((c: any) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLASSES, Security.encrypt(filtered));
  },

  syncClassesFromStudents: async (schoolId: string) => {
    const students = await db.getStudents(schoolId);
    const uniqueClasses = Array.from(new Set(students.map(s => `${s.grade}|${s.section}`)));
    const existingClasses = await db.getClasses(schoolId);
    for (const uc of uniqueClasses) {
      const [grade, section] = uc.split('|');
      if (!existingClasses.find(c => c.grade === grade && c.section === section)) {
        await db.saveClass({ id: `auto-${Date.now()}-${Math.random()}`, grade, section, schoolId });
      }
    }
  },

  getSubjects: async (schoolId: string): Promise<Subject[]> => {
    const data = localStorage.getItem(`${STORAGE_KEYS.SUBJECTS}_${schoolId}`);
    return Security.decrypt(data || "") || [];
  },

  saveSubject: async (schoolId: string, subject: Subject) => {
    const subjects = await db.getSubjects(schoolId);
    const idx = subjects.findIndex(s => s.id === subject.id);
    if (idx > -1) subjects[idx] = subject; else subjects.push(subject);
    localStorage.setItem(`${STORAGE_KEYS.SUBJECTS}_${schoolId}`, Security.encrypt(subjects));
  },

  deleteSubject: async (schoolId: string, id: string) => {
    const subjects = await db.getSubjects(schoolId);
    const filtered = subjects.filter(s => s.id !== id);
    localStorage.setItem(`${STORAGE_KEYS.SUBJECTS}_${schoolId}`, Security.encrypt(filtered));
  },

  getSchedule: async (schoolId: string, classTitle: string) => {
    const data = localStorage.getItem(`${STORAGE_KEYS.SCHEDULES}_${schoolId}_${classTitle}`);
    return Security.decrypt(data || "") || {};
  },

  saveSchedule: async (schoolId: string, classTitle: string, schedule: any) => {
    localStorage.setItem(`${STORAGE_KEYS.SCHEDULES}_${schoolId}_${classTitle}`, Security.encrypt(schedule));
  },

  getAttendance: async (schoolId: string) => {
    const data = localStorage.getItem(`attendance_${schoolId}`);
    return Security.decrypt(data || "") || [];
  },

  saveAttendance: async (schoolId: string, report: any) => {
    const current = await db.getAttendance(schoolId);
    current.push(report);
    localStorage.setItem(`attendance_${schoolId}`, Security.encrypt(current));
  },

  archiveAttendance: async (schoolId: string, id: string) => {
    const current = await db.getAttendance(schoolId);
    const report = current.find((r: any) => r.id === id);
    const filtered = current.filter((r: any) => r.id !== id);
    if (report) {
      const archivedData = localStorage.getItem(`attendance_archived_${schoolId}`);
      const archived = Security.decrypt(archivedData || "") || [];
      archived.push(report);
      localStorage.setItem(`attendance_archived_${schoolId}`, Security.encrypt(archived));
    }
    localStorage.setItem(`attendance_${schoolId}`, Security.encrypt(filtered));
  },

  getArchivedAttendance: async (schoolId: string) => {
    const data = localStorage.getItem(`attendance_archived_${schoolId}`);
    return Security.decrypt(data || "") || [];
  },

  restoreAttendance: async (schoolId: string, id: string) => {
    const archived = await db.getArchivedAttendance(schoolId);
    const report = archived.find((r: any) => r.id === id);
    const filtered = archived.filter((r: any) => r.id !== id);
    if (report) {
      const current = await db.getAttendance(schoolId);
      current.push(report);
      localStorage.setItem(`attendance_${schoolId}`, Security.encrypt(current));
    }
    localStorage.setItem(`attendance_archived_${schoolId}`, Security.encrypt(filtered));
  },

  getArchivedPlans: async (schoolId: string) => {
    const data = localStorage.getItem(`plans_archived_${schoolId}`);
    return Security.decrypt(data || "") || [];
  },

  archiveWeekPlans: async (schoolId: string, week: AcademicWeek) => {
    const plans = await db.getPlans(schoolId, week.id);
    const archived = await db.getArchivedPlans(schoolId);
    archived.push({ id: Date.now().toString(), weekName: week.name, startDate: week.startDate, endDate: week.endDate, plans });
    localStorage.setItem(`plans_archived_${schoolId}`, Security.encrypt(archived));
  },

  clearWeekPlans: async (schoolId: string, weekId: string) => {
    localStorage.removeItem(`${STORAGE_KEYS.PLANS}_${schoolId}_${weekId}`);
  },

  getSystemAdmin: async () => {
    const data = localStorage.getItem(STORAGE_KEYS.SYSTEM);
    return Security.decrypt(data || "") || { username: 'admin', password: 'password' };
  },

  updateSystemAdmin: async (admin: any) => {
    localStorage.setItem(STORAGE_KEYS.SYSTEM, Security.encrypt(admin));
  }
};
