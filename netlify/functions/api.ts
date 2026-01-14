
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export const handler = async (event: any) => {
  const { httpMethod, path, queryStringParameters } = event;
  const body = event.body ? JSON.parse(event.body) : null;
  const action = queryStringParameters?.action;

  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (httpMethod === 'OPTIONS') return { statusCode: 200, headers };

    switch (action) {
      case 'getSchools':
        const schools = await sql`SELECT * FROM schools`;
        return { statusCode: 200, headers, body: JSON.stringify(schools) };

      case 'saveSchool':
        await sql`
          INSERT INTO schools (id, name, slug, email, admin_username, admin_password, subscription_active, expiry_date)
          VALUES (${body.id}, ${body.name}, ${body.slug}, ${body.email}, ${body.adminUsername}, ${body.adminPassword}, ${body.subscriptionActive}, ${body.expiryDate})
          ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name,
            admin_password = EXCLUDED.admin_password,
            subscription_active = EXCLUDED.subscription_active,
            expiry_date = EXCLUDED.expiry_date
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added deleteSchool backend implementation
      case 'deleteSchool':
        await sql`DELETE FROM schools WHERE id = ${queryStringParameters.id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'getSchoolBySlug':
        const school = await sql`SELECT * FROM schools WHERE slug = ${queryStringParameters.slug} LIMIT 1`;
        return { statusCode: 200, headers, body: JSON.stringify(school[0]) };

      case 'getTeachers':
        const teachers = await sql`SELECT * FROM teachers WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify(teachers) };

      case 'saveTeacher':
        await sql`
          INSERT INTO teachers (id, name, username, password, school_id)
          VALUES (${body.id}, ${body.name}, ${body.username}, ${body.password}, ${body.schoolId})
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added deleteTeacher backend implementation
      case 'deleteTeacher':
        await sql`DELETE FROM teachers WHERE id = ${queryStringParameters.id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'getStudents':
        const students = await sql`SELECT * FROM students WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify(students) };

      case 'saveBulkStudents':
        for (const std of body) {
          await sql`
            INSERT INTO students (id, name, grade, section, phone_number, school_id)
            VALUES (${std.id}, ${std.name}, ${std.grade}, ${std.section}, ${std.phoneNumber}, ${std.schoolId})
            ON CONFLICT (id) DO NOTHING
          `;
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added deleteAllStudents backend implementation
      case 'deleteAllStudents':
        await sql`DELETE FROM students WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added getClasses backend implementation
      case 'getClasses':
        const classes = await sql`SELECT * FROM classes WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify(classes) };

      // Fix: Added saveClass backend implementation
      case 'saveClass':
        await sql`
          INSERT INTO classes (id, grade, section, school_id)
          VALUES (${body.id}, ${body.grade}, ${body.section}, ${body.schoolId})
          ON CONFLICT (id) DO UPDATE SET grade = EXCLUDED.grade, section = EXCLUDED.section
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added deleteClass backend implementation
      case 'deleteClass':
        await sql`DELETE FROM classes WHERE id = ${queryStringParameters.id} AND school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added getSubjects backend implementation
      case 'getSubjects':
        const subjects = await sql`SELECT * FROM subjects WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify(subjects) };

      // Fix: Added saveSubject backend implementation
      case 'saveSubject':
        const subjId = body.id || `s-${Date.now()}`;
        await sql`
          INSERT INTO subjects (id, name, school_id)
          VALUES (${subjId}, ${body.name}, ${queryStringParameters.schoolId})
          ON CONFLICT (id) DO NOTHING
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added deleteSubject backend implementation
      case 'deleteSubject':
        await sql`DELETE FROM subjects WHERE id = ${queryStringParameters.id} AND school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'getSchedule':
        const schedule = await sql`SELECT * FROM schedules WHERE school_id = ${queryStringParameters.schoolId} AND class_title = ${queryStringParameters.classTitle}`;
        const scheduleMap = {};
        schedule.forEach(s => {
          scheduleMap[`${s.day_id}_${s.period}`] = { subjectId: s.subject_id, teacherId: s.teacher_id };
        });
        return { statusCode: 200, headers, body: JSON.stringify(scheduleMap) };

      case 'saveSchedule':
        for (const [key, val] of Object.entries(body)) {
          const [dayId, period] = key.split('_');
          await sql`
            INSERT INTO schedules (school_id, class_title, day_id, period, subject_id, teacher_id)
            VALUES (${queryStringParameters.schoolId}, ${queryStringParameters.classTitle}, ${dayId}, ${period}, ${val.subjectId}, ${val.teacherId})
            ON CONFLICT (school_id, class_title, day_id, period) DO UPDATE SET
              subject_id = EXCLUDED.subject_id,
              teacher_id = EXCLUDED.teacher_id
          `;
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'getWeeks':
        const weeks = await sql`SELECT * FROM academic_weeks WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify(weeks) };

      case 'getActiveWeek':
        const activeWeek = await sql`SELECT * FROM academic_weeks WHERE school_id = ${queryStringParameters.schoolId} AND is_active = true LIMIT 1`;
        return { statusCode: 200, headers, body: JSON.stringify(activeWeek[0]) };

      // Fix: Added saveWeek backend implementation
      case 'saveWeek':
        await sql`
          INSERT INTO academic_weeks (id, name, start_date, end_date, is_active, school_id)
          VALUES (${body.id}, ${body.name}, ${body.startDate}, ${body.endDate}, ${body.isActive}, ${queryStringParameters.schoolId})
          ON CONFLICT (id) DO NOTHING
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added setActiveWeek backend implementation
      case 'setActiveWeek':
        await sql`UPDATE academic_weeks SET is_active = false WHERE school_id = ${queryStringParameters.schoolId}`;
        await sql`UPDATE academic_weeks SET is_active = true WHERE id = ${queryStringParameters.weekId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added deleteWeek backend implementation
      case 'deleteWeek':
        await sql`DELETE FROM academic_weeks WHERE id = ${queryStringParameters.weekId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      case 'getPlans':
        const plans = await sql`SELECT * FROM plans WHERE school_id = ${queryStringParameters.schoolId} AND week_id = ${queryStringParameters.weekId}`;
        const plansMap = {};
        plans.forEach(p => {
          plansMap[p.plan_key] = { lesson: p.lesson, homework: p.homework, enrichment: p.enrichment };
        });
        return { statusCode: 200, headers, body: JSON.stringify(plansMap) };

      case 'savePlan':
        await sql`
          INSERT INTO plans (school_id, week_id, plan_key, lesson, homework, enrichment)
          VALUES (${body.schoolId}, ${body.weekId}, ${body.planKey}, ${body.entry.lesson}, ${body.entry.homework}, ${body.entry.enrichment})
          ON CONFLICT (school_id, week_id, plan_key) DO UPDATE SET
            lesson = EXCLUDED.lesson,
            homework = EXCLUDED.homework,
            enrichment = EXCLUDED.enrichment
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added getArchivedPlans backend implementation
      case 'getArchivedPlans':
        const archivedPlans = await sql`SELECT * FROM archived_plans WHERE school_id = ${queryStringParameters.schoolId}`;
        return { statusCode: 200, headers, body: JSON.stringify(archivedPlans) };

      // Fix: Added archiveWeekPlans backend implementation
      case 'archiveWeekPlans':
        await sql`
          INSERT INTO archived_plans (id, school_id, week_id, week_name, start_date, end_date)
          VALUES (${Date.now().toString()}, ${queryStringParameters.schoolId}, ${body.id}, ${body.name}, ${body.startDate}, ${body.endDate})
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added clearWeekPlans backend implementation
      case 'clearWeekPlans':
        await sql`DELETE FROM plans WHERE school_id = ${queryStringParameters.schoolId} AND week_id = ${queryStringParameters.weekId}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added getAttendance backend implementation
      case 'getAttendance':
        const attendance = await sql`SELECT * FROM attendance WHERE school_id = ${queryStringParameters.schoolId} AND is_archived = false`;
        return { statusCode: 200, headers, body: JSON.stringify(attendance) };

      // Fix: Added saveAttendance backend implementation
      case 'saveAttendance':
        await sql`
          INSERT INTO attendance (id, school_id, date, day, teacher_name, class_name, absent_count, students, is_archived)
          VALUES (${body.id}, ${queryStringParameters.schoolId}, ${body.date}, ${body.day}, ${body.teacherName}, ${body.className}, ${body.absentCount}, ${JSON.stringify(body.students)}, false)
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added getArchivedAttendance backend implementation
      case 'getArchivedAttendance':
        const archivedAttendance = await sql`SELECT * FROM attendance WHERE school_id = ${queryStringParameters.schoolId} AND is_archived = true`;
        return { statusCode: 200, headers, body: JSON.stringify(archivedAttendance) };

      // Fix: Added archiveAttendance backend implementation
      case 'archiveAttendance':
        await sql`UPDATE attendance SET is_archived = true WHERE id = ${queryStringParameters.id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added restoreAttendance backend implementation
      case 'restoreAttendance':
        await sql`UPDATE attendance SET is_archived = false WHERE id = ${queryStringParameters.id}`;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      // Fix: Added getSystemAdmin backend implementation
      case 'getSystemAdmin':
        const admin = await sql`SELECT * FROM system_admins LIMIT 1`;
        return { statusCode: 200, headers, body: JSON.stringify(admin[0] || { username: 'admin', password: 'password' }) };

      // Fix: Added updateSystemAdmin backend implementation
      case 'updateSystemAdmin':
        await sql`
          INSERT INTO system_admins (username, password)
          VALUES (${body.username}, ${body.password})
          ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
        `;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

      default:
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Action not found' }) };
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
