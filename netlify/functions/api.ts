
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// استخدام الرابط من متغيرات البيئة - ضروري للأمان
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export const handler = async (event: any) => {
  const { httpMethod, queryStringParameters } = event;
  const action = queryStringParameters?.action;
  const body = event.body ? JSON.parse(event.body) : null;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  try {
    switch (action) {
      // --- إدارة المدارس ---
      case 'getSchools':
        const schools = await sql`SELECT * FROM schools ORDER BY name ASC`;
        return { statusCode: 200, headers, body: JSON.stringify(schools) };

      case 'getSchoolBySlug':
        const schoolResult = await sql`SELECT * FROM schools WHERE slug = ${queryStringParameters.slug} LIMIT 1`;
        return { statusCode: 200, headers, body: JSON.stringify(schoolResult[0] || null) };

      case 'saveSchool':
        await sql`
          INSERT INTO schools (id, name, slug, email, admin_username, admin_password, subscription_active, expiry_date, header_content, general_messages, weekly_notes, logo_url, weekly_notes_image)
          VALUES (${body.id}, ${body.name}, ${body.slug}, ${body.email}, ${body.adminUsername}, ${body.adminPassword}, ${body.subscriptionActive}, ${body.expiryDate}, ${body.headerContent || ''}, ${body.generalMessages || ''}, ${body.weeklyNotes || ''}, ${body.logoUrl || ''}, ${body.weeklyNotesImage || ''})
          ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            email = EXCLUDED.email,
            admin_username = EXCLUDED.admin_username,
            admin_password = EXCLUDED.admin_password,
            subscription_active = EXCLUDED.subscription_active,
            expiry_date = EXCLUDED.expiry_date,
            header_content = EXCLUDED.header_content,
            general_messages = EXCLUDED.general_messages,
            weekly_notes = EXCLUDED.weekly_notes,
            logo_url = EXCLUDED.logo_url,
            weekly_notes_image = EXCLUDED.weekly_notes_image
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'deleteSchool':
        await sql`DELETE FROM schools WHERE id = ${queryStringParameters.id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // --- إدارة المعلمين ---
      case 'getTeachers':
        const teachers = await sql`SELECT * FROM teachers WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify(teachers) };

      case 'saveTeacher':
        await sql`
          INSERT INTO teachers (id, name, username, password, school_id)
          VALUES (${body.id}, ${body.name}, ${body.username}, ${body.password}, ${body.schoolId})
          ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name, 
            username = EXCLUDED.username, 
            password = EXCLUDED.password
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'deleteTeacher':
        await sql`DELETE FROM teachers WHERE id = ${queryStringParameters.id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // --- إدارة الطلاب والفصول ---
      case 'getStudents':
        const students = await sql`SELECT * FROM students WHERE school_id = ${queryStringParameters.schoolId} ORDER BY name ASC`;
        return { statusCode: 200, headers, body: JSON.stringify(students) };

      case 'saveBulkStudents':
        for (const std of body) {
          await sql`
            INSERT INTO students (id, name, grade, section, phone_number, school_id)
            VALUES (${std.id}, ${std.name}, ${std.grade}, ${std.section}, ${std.phoneNumber}, ${std.schoolId})
            ON CONFLICT (id) DO UPDATE SET 
                name = EXCLUDED.name,
                grade = EXCLUDED.grade, 
                section = EXCLUDED.section,
                phone_number = EXCLUDED.phone_number
          `;
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'deleteAllStudents':
        await sql`DELETE FROM students WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'getClasses':
        const classes = await sql`SELECT * FROM classes WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify(classes) };

      case 'saveClass':
        await sql`
          INSERT INTO classes (id, grade, section, school_id)
          VALUES (${body.id}, ${body.grade}, ${body.section}, ${body.schoolId})
          ON CONFLICT (id) DO UPDATE SET grade = EXCLUDED.grade, section = EXCLUDED.section
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'deleteClass':
        await sql`DELETE FROM classes WHERE id = ${queryStringParameters.classId} AND school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'syncClassesFromStudents':
        // Logic to refresh classes table based on students table
        await sql`DELETE FROM classes WHERE school_id = ${queryStringParameters.schoolId}`;
        const distinctClasses = await sql`SELECT DISTINCT grade, section FROM students WHERE school_id = ${queryStringParameters.schoolId}`;
        for (const c of distinctClasses) {
          const id = `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await sql`INSERT INTO classes (id, grade, section, school_id) VALUES (${id}, ${c.grade}, ${c.section}, ${queryStringParameters.schoolId})`;
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // --- إدارة المواد ---
      case 'getSubjects':
        const subjects = await sql`SELECT * FROM subjects WHERE school_id = ${queryStringParameters.schoolId} ORDER BY name ASC`;
        return { statusCode: 200, headers, body: JSON.stringify(subjects) };

      case 'saveSubject':
        await sql`
          INSERT INTO subjects (id, name, school_id)
          VALUES (${body.id}, ${body.name}, ${queryStringParameters.schoolId})
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'deleteSubject':
        await sql`DELETE FROM subjects WHERE id = ${queryStringParameters.subjectId} AND school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // --- إدارة الجداول ---
      case 'getSchedule':
        const schedules = await sql`SELECT * FROM schedules WHERE school_id = ${queryStringParameters.schoolId} AND class_title = ${queryStringParameters.classTitle}`;
        const schedMap: Record<string, any> = {};
        schedules.forEach((s: any) => {
          schedMap[s.schedule_key] = { subjectId: s.subject_id, teacherId: s.teacher_id };
        });
        return { statusCode: 200, headers, body: JSON.stringify(schedMap) };

      case 'saveSchedule':
        for (const [key, val] of Object.entries(body)) {
          const v = val as any;
          await sql`
            INSERT INTO schedules (school_id, class_title, schedule_key, subject_id, teacher_id)
            VALUES (${queryStringParameters.schoolId}, ${queryStringParameters.classTitle}, ${key}, ${v.subjectId}, ${v.teacherId})
            ON CONFLICT (school_id, class_title, schedule_key) DO UPDATE SET
              subject_id = EXCLUDED.subject_id,
              teacher_id = EXCLUDED.teacher_id
          `;
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // --- الخطط الأسبوعية ---
      case 'getPlans':
        const plans = await sql`SELECT * FROM plans WHERE school_id = ${queryStringParameters.schoolId} AND week_id = ${queryStringParameters.weekId}`;
        return { statusCode: 200, headers, body: JSON.stringify(plans) };

      case 'savePlan':
        await sql`
          INSERT INTO plans (school_id, week_id, plan_key, lesson, homework, enrichment)
          VALUES (${body.schoolId}, ${body.weekId}, ${body.planKey}, ${body.lesson}, ${body.homework}, ${body.enrichment})
          ON CONFLICT (school_id, week_id, plan_key) DO UPDATE SET
            lesson = EXCLUDED.lesson,
            homework = EXCLUDED.homework,
            enrichment = EXCLUDED.enrichment
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'clearWeekPlans':
        await sql`DELETE FROM plans WHERE school_id = ${queryStringParameters.schoolId} AND week_id = ${queryStringParameters.weekId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'archiveWeekPlans':
        const currentPlans = await sql`SELECT * FROM plans WHERE school_id = ${queryStringParameters.schoolId} AND week_id = ${body.id}`;
        await sql`
          INSERT INTO archived_plans (school_id, week_id, week_name, start_date, end_date, plans_data)
          VALUES (${queryStringParameters.schoolId}, ${body.id}, ${body.name}, ${body.startDate}, ${body.endDate}, ${JSON.stringify(currentPlans)})
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'getArchivedPlans':
        const archived = await sql`SELECT * FROM archived_plans WHERE school_id = ${queryStringParameters.schoolId} ORDER BY created_at DESC`;
        return { statusCode: 200, headers, body: JSON.stringify(archived) };

      // --- الحضور والغياب ---
      case 'getAttendance':
        const attendance = await sql`SELECT * FROM attendance WHERE school_id = ${queryStringParameters.schoolId} AND archived = false ORDER BY timestamp DESC`;
        return { statusCode: 200, headers, body: JSON.stringify(attendance) };

      case 'saveAttendance':
        await sql`
          INSERT INTO attendance (id, school_id, date, day, teacher_name, class_name, absent_count, students)
          VALUES (${body.id}, ${body.schoolId}, ${body.date}, ${body.day}, ${body.teacherName}, ${body.className}, ${body.absentCount}, ${JSON.stringify(body.students)})
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'getArchivedAttendance':
        const archivedAtt = await sql`SELECT * FROM attendance WHERE school_id = ${queryStringParameters.schoolId} AND archived = true ORDER BY timestamp DESC`;
        return { statusCode: 200, headers, body: JSON.stringify(archivedAtt) };

      case 'archiveAttendance':
        await sql`UPDATE attendance SET archived = true WHERE id = ${queryStringParameters.id} AND school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'restoreAttendance':
        await sql`UPDATE attendance SET archived = false WHERE id = ${queryStringParameters.id} AND school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // --- إدارة الأسابيع ---
      case 'getWeeks':
        const weeks = await sql`SELECT * FROM weeks WHERE school_id = ${queryStringParameters.schoolId} ORDER BY start_date ASC`;
        return { statusCode: 200, headers, body: JSON.stringify(weeks) };

      case 'saveWeek':
        await sql`
          INSERT INTO weeks (id, name, start_date, end_date, is_active, school_id)
          VALUES (${body.id}, ${body.name}, ${body.startDate}, ${body.endDate}, ${body.isActive}, ${queryStringParameters.schoolId})
          ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name, 
            start_date = EXCLUDED.start_date, 
            end_date = EXCLUDED.end_date,
            is_active = EXCLUDED.is_active
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'setActiveWeek':
        await sql`UPDATE weeks SET is_active = false WHERE school_id = ${queryStringParameters.schoolId}`;
        await sql`UPDATE weeks SET is_active = true WHERE id = ${queryStringParameters.weekId} AND school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'deleteWeek':
        await sql`DELETE FROM weeks WHERE id = ${queryStringParameters.weekId} AND school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // --- إعدادات النظام ---
      case 'getSystemAdmin':
        const admin = await sql`SELECT * FROM system_admin LIMIT 1`;
        return { statusCode: 200, headers, body: JSON.stringify(admin[0] || { username: 'admin', password: 'password' }) };

      case 'updateSystemAdmin':
        await sql`DELETE FROM system_admin`;
        await sql`INSERT INTO system_admin (username, password) VALUES (${body.username}, ${body.password})`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      default:
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unsupported action' }) };
    }
  } catch (err: any) {
    console.error('API Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
