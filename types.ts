
export type UserRole = 'SYSTEM_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PUBLIC';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  email: string;
  subscription_status?: 'active' | 'expired';
  expiry_date?: string;
  logo_url?: string;
  // App-specific properties mapped in constants.tsx from snake_case database fields
  adminUsername?: string;
  adminPassword?: string;
  subscriptionActive?: boolean;
  expiryDate?: string;
  headerContent?: string;
  generalMessages?: string;
  weeklyNotes?: string;
  logoUrl?: string;
  weeklyNotesImage?: string;
  adminPhone?: string;
  studentCount?: number;
  teacherCount?: number;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  school_id: string;
  schoolId?: string; // Mapped camelCase
  phoneNumber?: string; // Mapped camelCase
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  password?: string;
  subjects: string[];
  schoolId: string;
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
