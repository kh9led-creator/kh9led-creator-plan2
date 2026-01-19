
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const sql = neon(process.env.DATABASE_URL!);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware لمعالجة طلبات الـ API الموحدة
// Fix: Use 'any' to bypass Express typing issues in this environment
app.all('/api', async (req: any, res: any) => {
  const action = req.query.action as string;
  const body = req.body;
  const q = req.query;

  try {
    switch (action) {
      // --- إدارة المدارس ---
      case 'getSchools':
        return res.json(await sql`SELECT * FROM schools ORDER BY name ASC`);
      
      case 'getSchoolBySlug':
        const s = await sql`SELECT * FROM schools WHERE slug = ${q.slug as string} LIMIT 1`;
        return res.json(s[0] || null);

      case 'saveSchool':
        await sql`
          INSERT INTO schools (id, name, slug, email, admin_username, admin_password, subscription_active, expiry_date, header_content, general_messages, weekly_notes, logo_url, weekly_notes_image)
          VALUES (${body.id}, ${body.name}, ${body.slug}, ${body.email}, ${body.adminUsername}, ${body.adminPassword}, ${body.subscriptionActive}, ${body.expiryDate}, ${body.headerContent || ''}, ${body.generalMessages || ''}, ${body.weeklyNotes || ''}, ${body.logoUrl || ''}, ${body.weekly_notes_image || ''})
          ON CONFLICT (id) DO UPDATE SET 
            name = EXCLUDED.name, slug = EXCLUDED.slug, admin_password = EXCLUDED.admin_password, 
            subscription_active = EXCLUDED.subscription_active, header_content = EXCLUDED.header_content,
            general_messages = EXCLUDED.general_messages, weekly_notes = EXCLUDED.weekly_notes,
            logo_url = EXCLUDED.logo_url, weekly_notes_image = EXCLUDED.weekly_notes_image,
            expiry_date = EXCLUDED.expiry_date
        `;
        return res.json({ success: true });

      case 'deleteSchool':
        await sql`DELETE FROM schools WHERE id = ${q.id as string}`;
        return res.json({ success: true });

      // --- إدارة المعلمين ---
      case 'getTeachers':
        return res.json(await sql`SELECT * FROM teachers WHERE school_id = ${q.schoolId as string}`);

      case 'saveTeacher':
        await sql`
          INSERT INTO teachers (id, name, username, password, school_id)
          VALUES (${body.id}, ${body.name}, ${body.username}, ${body.password}, ${body.schoolId})
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, username = EXCLUDED.username
        `;
        return res.json({ success: true });

      case 'deleteTeacher':
        await sql`DELETE FROM teachers WHERE id = ${q.id as string}`;
        return res.json({ success: true });

      // --- إدارة الطلاب والفصول ---
      case 'getStudents':
        return res.json(await sql`SELECT * FROM students WHERE school_id = ${q.schoolId as string} ORDER BY name ASC`);

      case 'saveBulkStudents':
        for (const std of body) {
          await sql`
            INSERT INTO students (id, name, grade, section, phone_number, school_id)
            VALUES (${std.id}, ${std.name}, ${std.grade}, ${std.section}, ${std.phoneNumber}, ${std.schoolId})
            ON CONFLICT (id) DO UPDATE SET grade = EXCLUDED.grade, section = EXCLUDED.section, phone_number = EXCLUDED.phone_number
          `;
        }
        return res.json({ success: true });

      case 'deleteAllStudents':
        await sql`DELETE FROM students WHERE school_id = ${q.schoolId as string}`;
        return res.json({ success: true });

      case 'getClasses':
        return res.json(await sql`SELECT * FROM classes WHERE school_id = ${q.schoolId as string}`);

      case 'saveClass':
        await sql`INSERT INTO classes (id, grade, section, school_id) VALUES (${body.id}, ${body.grade}, ${body.section}, ${body.schoolId}) ON CONFLICT (id) DO UPDATE SET grade = EXCLUDED.grade, section = EXCLUDED.section`;
        return res.json({ success: true });

      case 'syncClassesFromStudents':
        await sql`DELETE FROM classes WHERE school_id = ${q.schoolId as string}`;
        const dist = await sql`SELECT DISTINCT grade, section FROM students WHERE school_id = ${q.schoolId as string}`;
        for (const c of dist) {
          const id = `c-${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
          await sql`INSERT INTO classes (id, grade, section, school_id) VALUES (${id}, ${c.grade}, ${c.section}, ${q.schoolId as string})`;
        }
        return res.json({ success: true });

      // --- إدارة المواد والجداول ---
      case 'getSubjects':
        return res.json(await sql`SELECT * FROM subjects WHERE school_id = ${q.schoolId as string} ORDER BY name ASC`);

      case 'saveSubject':
        await sql`INSERT INTO subjects (id, name, school_id) VALUES (${body.id}, ${body.name}, ${q.schoolId as string}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`;
        return res.json({ success: true });

      case 'getSchedule':
        const scheds = await sql`SELECT * FROM schedules WHERE school_id = ${q.schoolId as string} AND class_title = ${q.classTitle as string}`;
        const map: any = {};
        scheds.forEach(s => map[s.schedule_key] = { subjectId: s.subject_id, teacherId: s.teacher_id });
        return res.json(map);

      case 'saveSchedule':
        for (const [key, val] of Object.entries(body)) {
          const v = val as any;
          await sql`
            INSERT INTO schedules (school_id, class_title, schedule_key, subject_id, teacher_id)
            VALUES (${q.schoolId as string}, ${q.classTitle as string}, ${key}, ${v.subjectId}, ${v.teacherId})
            ON CONFLICT (school_id, class_title, schedule_key) DO UPDATE SET subject_id = EXCLUDED.subject_id, teacher_id = EXCLUDED.teacher_id
          `;
        }
        return res.json({ success: true });

      // --- الخطط الأسبوعية ---
      case 'getPlans':
        return res.json(await sql`SELECT * FROM plans WHERE school_id = ${q.schoolId as string} AND week_id = ${q.weekId as string}`);

      case 'savePlan':
        await sql`
          INSERT INTO plans (school_id, week_id, plan_key, lesson, homework, enrichment)
          VALUES (${body.schoolId}, ${body.weekId}, ${body.planKey}, ${body.lesson}, ${body.homework}, ${body.enrichment})
          ON CONFLICT (school_id, week_id, plan_key) DO UPDATE SET lesson = EXCLUDED.lesson, homework = EXCLUDED.homework, enrichment = EXCLUDED.enrichment
        `;
        return res.json({ success: true });

      case 'getWeeks':
        return res.json(await sql`SELECT * FROM weeks WHERE school_id = ${q.schoolId as string} ORDER BY start_date ASC`);

      case 'saveWeek':
        await sql`INSERT INTO weeks (id, name, start_date, end_date, is_active, school_id) VALUES (${body.id}, ${body.name}, ${body.startDate}, ${body.endDate}, ${body.isActive}, ${q.schoolId as string}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active`;
        return res.json({ success: true });

      case 'setActiveWeek':
        await sql`UPDATE weeks SET is_active = false WHERE school_id = ${q.schoolId as string}`;
        await sql`UPDATE weeks SET is_active = true WHERE id = ${q.weekId as string}`;
        return res.json({ success: true });

      // --- الحضور والغياب ---
      case 'saveAttendance':
        await sql`INSERT INTO attendance (id, school_id, date, day, teacher_name, class_name, absent_count, students, timestamp) VALUES (${body.id}, ${body.schoolId}, ${body.date}, ${body.day}, ${body.teacherName}, ${body.className}, ${body.absentCount}, ${JSON.stringify(body.students)}, ${new Date().toISOString()})`;
        return res.json({ success: true });

      case 'getAttendance':
        return res.json(await sql`SELECT * FROM attendance WHERE school_id = ${q.schoolId as string} AND archived = false ORDER BY timestamp DESC`);

      // --- إعدادات النظام ---
      case 'getSystemAdmin':
        const admin = await sql`SELECT * FROM system_admin LIMIT 1`;
        return res.json(admin[0] || { username: 'admin', password: 'password' });

      case 'updateSystemAdmin':
        await sql`DELETE FROM system_admin`;
        await sql`INSERT INTO system_admin (username, password) VALUES (${body.username}, ${body.password})`;
        return res.json({ success: true });

      default:
        return res.status(400).json({ error: 'Action not found' });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// خدمة ملفات الـ Frontend
app.use(express.static(path.join(__dirname, 'dist')));
// Fix: Use 'any' for catch-all route to avoid SendFile typing error
app.get('*', (req: any, res: any) => {
  if (req.path.startsWith('/api')) return;
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
