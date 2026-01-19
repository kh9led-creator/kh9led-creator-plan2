
import { ApiResponse, User, SystemStats, School } from './types';

// الحصول على رابط الـ API بشكل ديناميكي
export const getApiUrl = () => {
  const origin = window.location.origin;
  // في الـ Production يكون المسار هو api.php مباشرة في الـ public folder
  return `${origin}/api.php`;
};

export const apiCall = async <T = any>(action: string, body: any = null): Promise<ApiResponse<T>> => {
  try {
    const url = `${getApiUrl()}?action=${action}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : JSON.stringify({}),
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'خطأ في الاتصال بالسيرفر' 
    };
  }
};

export const db = {
  adminLogin: (credentials: any) => apiCall<User>('admin_login', credentials),
  schoolLogin: (credentials: any) => apiCall<User>('school_login', credentials),
  getSystemStats: () => apiCall<SystemStats>('get_system_stats'),
  getAllSchools: () => apiCall<School[]>('get_all_schools'),
  importStudents: (data: { students: any[], schoolId: string }) => apiCall('import_students', data),
};
