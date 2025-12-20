
export type UserRole = 'SYSTEM_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PUBLIC';

export interface School {
  id: string;
  name: string;
  email: string;
  adminUsername?: string;
  adminPhone?: string;
  logoUrl?: string;
  headerContent?: string;
  generalMessages?: string;
  weeklyNotes?: string;
  weeklyNotesImage?: string;
  subscriptionActive: boolean;
  slug: string;
  adminPassword?: string; // سيعامل كـ Hash في النسخة المتقدمة
  studentCount: number;
  teacherCount: number;
  expiryDate: string;
  token?: string; // للتحقق من الجلسة
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  password?: string;
  subjects: string[];
  schoolId: string;
  token?: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  phoneNumber: string;
  schoolId: string;
}

export interface AcademicWeek {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SchoolClass {
  id: string;
  grade: string;
  section: string;
  schoolId: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface AppState {
  currentSchool: School | null;
  currentUser: any | null;
  role: UserRole;
  isAuthenticated: boolean;
}
