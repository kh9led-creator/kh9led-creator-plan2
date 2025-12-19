
export type UserRole = 'SYSTEM_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PUBLIC';

export interface School {
  id: string;
  name: string;
  email: string;
  adminPhone?: string;
  logoUrl?: string;
  headerContent?: string;
  generalMessages?: string;
  weeklyNotes?: string;
  weeklyNotesImage?: string;
  subscriptionActive: boolean;
  slug: string;
  adminPassword?: string;
  studentCount: number;
  teacherCount: number;
  expiryDate: string;
}

export interface AcademicWeek {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  password?: string;
  subjects: string[];
  schoolId: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  phoneNumber: string;
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

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isAnnouncement?: boolean;
}

export interface AppState {
  currentSchool: School | null;
  currentUser: any | null;
  role: UserRole;
}
