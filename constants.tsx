
import { School, Teacher, Student, Subject } from './types';

export const DAYS = [
  { id: 'sun', label: 'الأحد' },
  { id: 'mon', label: 'الإثنين' },
  { id: 'tue', label: 'الثلاثاء' },
  { id: 'wed', label: 'الأربعاء' },
  { id: 'thu', label: 'الخميس' }
];

export const PERIODS = [1, 2, 3, 4, 5, 6, 7];

export const MOCK_SCHOOLS: School[] = [
  {
    id: '1',
    name: 'مدرسة أحد الابتدائية',
    slug: 'ohod-school',
    headerContent: 'وزارة التعليم - الإدارة العامة للتعليم بالمنطقة الشرقية\nمدرسة أحد الابتدائية للبنين',
    generalMessages: 'يرجى من ولي أمر الطالب الكريم متابعة ابنكم في رصد الواجبات والدروس اليومية.',
    weeklyNotes: 'يرجى إحضار الأدوات الفنية ليوم الثلاثاء القادم.',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x_Pz9E_qS8YV0Y4Xj_mI7Fq_YF8_H6J1_A&s',
    subscriptionActive: true,
    studentCount: 450,
    teacherCount: 32,
    expiryDate: '2025-12-30'
  },
  {
    id: '2',
    name: 'مدرسة التميز العالمية',
    slug: 'excellence-intl',
    headerContent: 'التعليم الأهلي - مدرسة التميز العالمية\nقسم البنين والبنات',
    subscriptionActive: false,
    studentCount: 210,
    teacherCount: 15,
    expiryDate: '2024-01-15'
  }
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: '1', name: 'لغتي' },
  { id: '2', name: 'علوم' },
  { id: '3', name: 'فنية' },
  { id: '4', name: 'رياضيات' }
];

export const MOCK_TEACHERS: Teacher[] = [
  { id: 't1', name: 'أ. محمد العتيبي', username: 'mohammad_ati', subjects: ['1', '2'] },
  { id: 't2', name: 'أ. سارة القحطاني', username: 'sara_q', subjects: ['3', '4'] }
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'أحمد إبراهيم', grade: 'الأول الابتدائي', section: '1', phoneNumber: '0500000001' },
  { id: 's2', name: 'خالد سلمان', grade: 'الأول الابتدائي', section: '1', phoneNumber: '0500000002' }
];
