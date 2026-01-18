
-- 1. جدول مدير النظام (System Admin)
CREATE TABLE system_admin (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

-- 2. جدول المدارس (Schools)
CREATE TABLE schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT,
    admin_username TEXT NOT NULL,
    admin_password TEXT NOT NULL,
    subscription_active BOOLEAN DEFAULT TRUE,
    expiry_date DATE,
    header_content TEXT,
    general_messages TEXT,
    weekly_notes TEXT,
    logo_url TEXT,
    weekly_notes_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول المعلمين (Teachers)
CREATE TABLE teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    school_id TEXT REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE(username, school_id) -- منع تكرار اسم المستخدم في نفس المدرسة
);

-- 4. جدول الطلاب (Students)
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    phone_number TEXT,
    school_id TEXT REFERENCES schools(id) ON DELETE CASCADE
);

-- 5. جدول الفصول الدراسية (Classes)
CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    school_id TEXT REFERENCES schools(id) ON DELETE CASCADE
);

-- 6. جدول المواد الدراسية (Subjects)
CREATE TABLE subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    school_id TEXT REFERENCES schools(id) ON DELETE CASCADE
);

-- 7. جدول الأسابيع الدراسية (Academic Weeks)
CREATE TABLE weeks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    school_id TEXT REFERENCES schools(id) ON DELETE CASCADE
);

-- 8. جدول جداول الحصص (Schedules)
CREATE TABLE schedules (
    school_id TEXT REFERENCES schools(id) ON DELETE CASCADE,
    class_title TEXT NOT NULL, -- "الأول الابتدائي - فصل 1"
    schedule_key TEXT NOT NULL, -- "sun_1" (اليوم_الحصة)
    subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
    PRIMARY KEY (school_id, class_title, schedule_key)
);

-- 9. جدول الخطط الأسبوعية (Weekly Plans)
CREATE TABLE plans (
    school_id TEXT REFERENCES schools(id) ON DELETE CASCADE,
    week_id TEXT REFERENCES weeks(id) ON DELETE CASCADE,
    plan_key TEXT NOT NULL, -- "الأول الابتدائي - فصل 1_sun_1"
    lesson TEXT,
    homework TEXT,
    enrichment TEXT,
    PRIMARY KEY (school_id, week_id, plan_key)
);

-- 10. جدول الحضور والغياب (Attendance)
CREATE TABLE attendance (
    id TEXT PRIMARY KEY,
    school_id TEXT REFERENCES schools(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    day TEXT NOT NULL,
    teacher_name TEXT,
    class_name TEXT,
    absent_count INTEGER DEFAULT 0,
    students JSONB, -- تخزين مصفوفة أسماء الطلاب الغائبين
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE
);

-- 11. جدول أرشيف الخطط (Archived Plans)
CREATE TABLE archived_plans (
    id SERIAL PRIMARY KEY,
    school_id TEXT REFERENCES schools(id) ON DELETE CASCADE,
    week_id TEXT,
    week_name TEXT,
    start_date DATE,
    end_date DATE,
    plans_data JSONB, -- لقطة كاملة لجميع الخطط في هذا الأسبوع
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- تحسينات الأداء (Indexes)
CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_teachers_school ON teachers(school_id);
CREATE INDEX idx_students_school_class ON students(school_id, grade, section);
CREATE INDEX idx_plans_lookup ON plans(school_id, week_id);
CREATE INDEX idx_attendance_school ON attendance(school_id);
