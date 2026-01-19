
<?php
/**
 * نظام خططي - المحرك الخلفي (Production Version)
 * خاص باستضافة Hostinger
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// بيانات قاعدة البيانات المحددة
$db_host = "localhost";
$db_user = "u368742687_plan2";
$db_pass = "Cash6010@";
$db_name = "u368742687_plan2";

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "error" => "Connection failed: " . $e->getMessage()]);
    exit();
}

// قراءة البيانات من الطلب
$input = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

// مخرجات موحدة
function response($success, $data = null, $message = "", $error = null) {
    echo json_encode([
        "success" => $success,
        "data" => $data,
        "message" => $message,
        "error" => $error
    ]);
    exit();
}

switch($action) {
    case 'admin_login':
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        
        // التحقق من جدول system_admin
        $stmt = $conn->prepare("SELECT * FROM system_admin WHERE username = ?");
        $stmt->execute([$username]);
        $admin = $stmt->fetch();

        // للسماح بالدخول الأول إذا كان الجدول فارغاً (admin/admin)
        if (!$admin && $username === 'admin' && $password === 'admin') {
            response(true, ["id" => "1", "name" => "المشرف العام", "username" => "admin", "role" => "SYSTEM_ADMIN"]);
        }

        if ($admin && $password === $admin['password']) {
            response(true, ["id" => "1", "name" => "المشرف العام", "username" => $admin['username'], "role" => "SYSTEM_ADMIN"]);
        } else {
            response(false, null, "بيانات الدخول غير صحيحة");
        }
        break;

    case 'school_login':
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        
        $stmt = $conn->prepare("SELECT * FROM schools WHERE admin_username = ? AND admin_password = ?");
        $stmt->execute([$username, $password]);
        $school = $stmt->fetch();

        if ($school) {
            response(true, [
                "id" => $school['id'],
                "name" => $school['name'],
                "username" => $school['admin_username'],
                "role" => "SCHOOL_ADMIN",
                "slug" => $school['slug']
            ]);
        } else {
            response(false, null, "بيانات المدرسة غير صحيحة");
        }
        break;

    case 'get_system_stats':
        try {
            $schoolsCount = $conn->query("SELECT COUNT(*) FROM schools")->fetchColumn();
            $studentsCount = $conn->query("SELECT COUNT(*) FROM students")->fetchColumn();
            $activeSchools = $conn->query("SELECT COUNT(*) FROM schools WHERE subscription_active = 1")->fetchColumn();
            
            response(true, [
                "totalSchools" => (int)$schoolsCount,
                "totalStudents" => (int)$studentsCount,
                "activeSubscriptions" => (int)$activeSchools
            ]);
        } catch(Exception $e) {
            response(false, null, $e->getMessage());
        }
        break;

    case 'get_all_schools':
        try {
            $stmt = $conn->query("SELECT id, name, slug, email, subscription_active as subscriptionActive, expiry_date as expiryDate FROM schools ORDER BY id DESC");
            response(true, $stmt->fetchAll());
        } catch(Exception $e) {
            response(false, null, $e->getMessage());
        }
        break;

    case 'import_students':
        $students = $input['students'] ?? [];
        $schoolId = $input['schoolId'] ?? '';
        
        if (empty($students)) response(false, null, "لا توجد بيانات");

        try {
            $conn->beginTransaction();
            $stmt = $conn->prepare("INSERT INTO students (id, name, grade, section, school_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), grade=VALUES(grade), section=VALUES(section)");
            foreach($students as $s) {
                $stmt->execute([$s['id'], $s['name'], $s['grade'], $s['section'], $schoolId]);
            }
            $conn->commit();
            response(true, null, "تم استيراد الطلاب بنجاح");
        } catch(Exception $e) {
            $conn->rollBack();
            response(false, null, "خطأ في القاعدة: " . $e->getMessage());
        }
        break;

    default:
        response(false, null, "Action not found: " . $action);
        break;
}
