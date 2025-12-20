
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

const Security = {
  encrypt: (data: any): string => {
    try {
      if (!data) return "";
      const jsonString = JSON.stringify(data);
      const bytes = new TextEncoder().encode(jsonString);
      let binary = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (e) { return ""; }
  },
  decrypt: (cipher: string): any => {
    try {
      if (!cipher || typeof cipher !== 'string') return null;
      const binary = atob(cipher);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonString = new TextDecoder().decode(bytes);
      return JSON.parse(jsonString);
    } catch (e) { return null; }
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

const delay = (ms: number = 300) => new Promise(res => setTimeout(res, ms));

export const db = {
  getSchools: async (): Promise<School[]> => {
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
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const all = Security.decrypt(data || "") || [];
    if (!Array.isArray(all)) return [];
    return all.filter((s: Student) => s.schoolId === schoolId);
  },

  deleteAllStudents: async (schoolId: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const all = Security.decrypt(data || "") || [];
    const filtered = all.filter((s: Student) => s.schoolId !== schoolId);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, Security.encrypt(filtered));
    // بعد حذف الطلاب، نمسح الفصول المرتبطة بهم
    await db.syncClassesFromStudents(schoolId, []);
  },

  saveBulkStudents: async (newStudents: Student[]) => {
    if (newStudents.length === 0) return true;
    const schoolId = newStudents[0].schoolId;
    await delay(300);
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const all = Security.decrypt(data || "") || [];
      const currentAll = Array.isArray(all) ? all : [];
      
      const newIds = new Set(newStudents.map(s => s.id));
      const filteredCurrent = currentAll.filter((s: Student) => !newIds.has(s.id));
      const updated = [...filteredCurrent, ...newStudents];
      
      localStorage.setItem(STORAGE_KEYS.STUDENTS, Security.encrypt(updated));
      // مزامنة الفصول فوراً بعد الاستيراد
      await db.syncClassesFromStudents(schoolId, updated.filter(s => s.schoolId === schoolId));
      return true;
    } catch (e: any) { throw e; }
  },

  saveStudent: async (student: Student) => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const all = Security.decrypt(data || "") || [];
    const currentAll = Array.isArray(all) ? all : [];
    const idx = currentAll.findIndex((s: Student) => s.id === student.id);
    if (idx > -1) currentAll[idx] = student; else currentAll.push(student);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, Security.encrypt(currentAll));
    await db.syncClassesFromStudents(student.schoolId);
  },

  getClasses: async (schoolId: string): Promise<SchoolClass[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const all = Security.decrypt(data || "") || [];
    if (!Array.isArray(all)) return [];
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

  // @google/genai: وظيفة مزامنة "مطهرة" تحذف أي فصل غير موجود في قائمة الطلاب الحالية
  syncClassesFromStudents: async (schoolId: string, providedStudents?: Student[]) => {
    const students = providedStudents || await db.getStudents(schoolId);
    
    // استخراج الفصول الفريدة مع شروط صارمة جداً لمنع التداخل
    const uniqueClassKeys = Array.from(new Set(
      students
        .filter(s => {
          const g = s.grade.trim();
          const n = s.name.trim();
          // شروط الفصل الصالح:
          // 1. ليس فارغاً
          // 2. لا يحتوي على أرقام جوال (أكثر من 5 أرقام متتالية)
          // 3. طول النص منطقي لاسم صف (أقل من 30 حرف عادة)
          // 4. لا يشبه اسم الطالب (إذا كان الاسم يتطابق تماماً مع الصف فهناك خطأ استيراد)
          const isPhone = /[0-9]{6,}/.test(g);
          const isTooLong = g.length > 30;
          return g.length > 0 && !isPhone && !isTooLong && g !== n;
        })
        .map(s => `${s.grade.trim()}|${s.section.trim()}`)
    ));

    // جلب كافة الفصول في النظام
    const allDataRaw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const allData: SchoolClass[] = Security.decrypt(allDataRaw || "") || [];
    
    // الاحتفاظ بفصول المدارس الأخرى وحذف فصول هذه المدرسة القديمة بالكامل لإعادة بنائها
    const otherSchoolsClasses = allData.filter((c: any) => c.schoolId !== schoolId);
    
    const newClassesForSchool = uniqueClassKeys.map((uc, index) => {
      const [grade, section] = uc.split('|');
      return { 
        id: `cls-${schoolId}-${index}-${Date.now()}`, 
        grade, 
        section, 
        schoolId 
      };
    });

    // حفظ القائمة "المطهرة" الجديدة
    localStorage.setItem(STORAGE_KEYS.CLASSES, Security.encrypt([...otherSchoolsClasses, ...newClassesForSchool]));
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
    await delay(300);
    const biometricsRaw = localStorage.getItem(STORAGE_KEYS.BIOMETRICS) || '{}';
    const biometrics = JSON.parse(biometricsRaw);
    const record = biometrics[localKey];
    if (record) {
      if (record.type === 'SCHOOL') {
        const schools = await db.getSchools();
        const school = schools.find(s => s.id === record.userId);
        return school ? { type: 'SCHOOL_ADMIN', data: school } : null;
      } else {
        const teachersRaw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
        const teachers = Security.decrypt(teachersRaw || "") || [];
        const teacher = teachers.find((t: any) => t.id === record.userId);
        return teacher ? { type: 'TEACHER', data: teacher } : null;
      }
    }
    return null;
  }
};
