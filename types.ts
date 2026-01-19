
export type UserRole = 'SYSTEM_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PUBLIC';

// Added missing properties to School interface to fix property access errors
export interface School {
  id: string;
  name: string;
  slug: string;
  email: string;
  adminUsername: string;
  adminPassword?: string; // Added for authentication
  adminPhone?: string;
  logoUrl?: string;
  headerContent?: string;
  generalMessages?: string;
  weeklyNotes?: string;
  weeklyNotesImage?: string;
  subscriptionActive: boolean;
  expiryDate: string;
  studentCount?: number; // Added for registration
  teacherCount?: number; // Added for registration
}

// Added missing properties to Teacher interface to fix property access errors
export interface Teacher {
  id: string;
  name: string;
  username: string;
  password?: string; // Added for registration/auth
  subjects?: string[]; // Added for management
  schoolId: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  phoneNumber?: string;
  schoolId: string;
}

// Added missing SchoolClass interface to resolve import errors in multiple files
export interface SchoolClass {
  id: string;
  grade: string;
  section: string;
  schoolId: string;
}

// Added missing Subject interface to resolve import errors in multiple files
export interface Subject {
  id: string;
  name: string;
}

// Added missing AcademicWeek interface to resolve import errors in multiple files
export interface AcademicWeek {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AppState {
  currentSchool: School | null;
  currentUser: any | null;
  role: UserRole;
  isAuthenticated: boolean;
}
