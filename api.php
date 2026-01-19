
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// إعدادات قاعدة البيانات - Hostinger
$db_host = "localhost";
$db_user = "u368742687_plan2"; // اسم المستخدم كما طلبت
$db_pass = "Cash6010@"; // يجب عليك وضع كلمة المرور هنا
$db_name = "u368742687_plan2";

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "error" => "فشل الاتصال بالقاعدة: " . $e->getMessage()]);
    exit();
}

// قراءة البيانات المرسلة
$input = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

switch($action) {
    case 'admin_login':
        $user = $input['username'] ?? '';
        $pass = $input['password'] ?? '';

        // نظام Mock Success في حال عدم وجود المشرف في القاعدة لتمكين الدخول الأول
        if ($user === 'admin' && $pass === 'admin') {
            echo json_encode([
                "success" => true,
                "data" => ["id" => "sys_1", "name" => "المشرف العام", "username" => "admin", "role" => "SYSTEM_ADMIN"]
            ]);
        } else {
            echo json_encode(["success" => false, "error" => "بيانات الدخول غير صحيحة"]);
        }
        break;

    case 'get_system_stats':
        try {
            $totalSchools = $conn->query("SELECT COUNT(*) FROM schools")->fetchColumn();
            $totalStudents = $conn->query("SELECT COUNT(*) FROM students")->fetchColumn();
            $activeSchools = $conn->query("SELECT COUNT(*) FROM schools WHERE subscription_active = 1")->fetchColumn();
            
            echo json_encode([
                "success" => true,
                "data" => [
                    "totalSchools" => (int)$totalSchools,
                    "totalStudents" => (int)$totalStudents,
                    "activeSubscriptions" => (int)$activeSchools
                ]
            ]);
        } catch(Exception $e) {
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
        break;

    case 'get_all_schools':
        try {
            $stmt = $conn->query("SELECT id, name, slug, subscription_active as subscriptionActive FROM schools ORDER BY created_at DESC");
            echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch(Exception $e) {
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
        break;

    case 'import_students':
        $students = $input['students'] ?? [];
        $schoolId = $input['schoolId'] ?? '';
        
        if (empty($students)) {
            echo json_encode(["success" => false, "error" => "لا توجد بيانات للاستيراد"]);
            break;
        }

        try {
            $conn->beginTransaction();
            $stmt = $conn->prepare("INSERT INTO students (id, name, grade, section, school_id) VALUES (?, ?, ?, ?, ?)");
            foreach($students as $s) {
                $stmt->execute([$s['id'], $s['name'], $s['grade'], $s['section'], $schoolId]);
            }
            $conn->commit();
            echo json_encode(["success" => true]);
        } catch(Exception $e) {
            $conn->rollBack();
            echo json_encode(["success" => false, "error" => "خطأ أثناء الحفظ: " . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["success" => false, "error" => "الإجراء غير معروف: " . $action]);
        break;
}
?>
