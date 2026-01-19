
export type UserRole = 'SYSTEM_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  schoolId?: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  email: string;
  adminUsername: string;
  adminPassword?: string;
  adminPhone?: string;
  expiryDate: string;
  subscriptionActive: boolean;
  studentCount?: number;
  teacherCount?: number;
  headerContent?: string;
  generalMessages?: string;
  weeklyNotes?: string;
  weeklyNotesImage?: string;
  logoUrl?: string;
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  password?: string;
  subjects?: string[];
  schoolId: string;
}

export interface Student {
  id: string;
  name: string;
  phoneNumber?: string;
  grade: string;
  section: string;
  schoolId: string;
  school_id?: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface SchoolClass {
  id: string;
  grade: string;
  section: string;
  schoolId: string;
}

export interface AcademicWeek {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SystemStats {
  totalSchools: number;
  totalStudents: number;
  activeSubscriptions: number;
}
