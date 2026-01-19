
<?php
/**
 * نظام إدارة الخطط المدرسية - API Core
 * تأكد من إنشاء قاعدة بيانات MySQL وتعديل البيانات أدناه
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// التعامل مع طلبات Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// إعدادات قاعدة البيانات
$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "school_plans_db";

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // في حالة عدم وجود اتصال، سنعمل بنظام Mock Success للتطوير الأولي
    $conn = null;
}

// قراءة البيانات المرسلة بصيغة JSON
$input = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

// الوظائف المساعدة
function sendResponse($success, $data = null, $message = "", $error = null) {
    echo json_encode([
        "success" => $success,
        "data" => $data,
        "message" => $message,
        "error" => $error
    ]);
    exit();
}

// معالجة الـ Actions الموحدة
switch($action) {
    case 'login_system_admin':
        $user = $input['username'] ?? '';
        $pass = $input['password'] ?? '';

        // نظام Mock Success في حال عدم وجود قاعدة بيانات لتسهيل الدخول الأول
        if (($user === 'admin' && $pass === 'admin123') || !$conn) {
            sendResponse(true, [
                "id" => "admin_1",
                "name" => "المشرف العام",
                "username" => "admin",
                "role" => "SYSTEM_ADMIN"
            ], "تم تسجيل الدخول بنجاح");
        }

        // الكود الفعلي للتحقق من قاعدة البيانات
        $stmt = $conn->prepare("SELECT * FROM system_admins WHERE username = ?");
        $stmt->execute([$user]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin && password_verify($pass, $admin['password'])) {
            sendResponse(true, [
                "id" => $admin['id'],
                "name" => $admin['name'],
                "username" => $admin['username'],
                "role" => "SYSTEM_ADMIN"
            ]);
        } else {
            sendResponse(false, null, "بيانات الدخول غير صحيحة");
        }
        break;

    case 'login_school':
        $user = $input['username'] ?? '';
        $pass = $input['password'] ?? '';

        // Mock للتحميل الأول
        if ($user === 'school' && $pass === '123456') {
            sendResponse(true, [
                "id" => "school_1",
                "name" => "مدير المدرسة",
                "username" => "school",
                "role" => "SCHOOL_ADMIN"
            ]);
        }
        
        sendResponse(false, null, "يرجى ربط قاعدة البيانات لتسجيل دخول المدارس");
        break;

    case 'get_system_stats':
        // إحصائيات وهمية في حال عدم وجود بيانات
        $stats = [
            "total_schools" => 24,
            "active_subscriptions" => 18,
            "total_students" => 12400
        ];
        sendResponse(true, $stats);
        break;

    case 'import_students':
        $students = $input['students'] ?? [];
        $school_id = $input['school_id'] ?? '';
        
        if (empty($students)) sendResponse(false, null, "لا توجد بيانات للمعالجة");
        
        // منطق الحفظ في قاعدة البيانات سيتم هنا
        sendResponse(true, null, "تم استلام " . count($students) . " سجل بنجاح");
        break;

    default:
        sendResponse(false, null, "الأمر المطلوب غير معروف (Action Not Found)");
        break;
}
?>
