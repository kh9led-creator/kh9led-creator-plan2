
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// إعدادات قاعدة البيانات - قم بتغييرها حسب بياناتك
$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "madrasati_db";

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["error" => "فشل الاتصال بقاعدة البيانات: " . $e->getMessage()]);
    exit();
}

// قراءة البيانات المرسلة
$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

switch($action) {
    case 'school_login':
        $user = $data['username'] ?? '';
        $pass = $data['password'] ?? '';
        
        $stmt = $conn->prepare("SELECT * FROM schools WHERE admin_username = ? AND admin_password = ? LIMIT 1");
        $stmt->execute([$user, $pass]);
        $school = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($school) {
            echo json_encode(["success" => true, "school" => $school]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "بيانات الدخول غير صحيحة"]);
        }
        break;

    case 'get_students':
        $school_id = $_GET['school_id'] ?? '';
        $stmt = $conn->prepare("SELECT * FROM students WHERE school_id = ?");
        $stmt->execute([$school_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'import_students':
        $students = $data['students'] ?? [];
        $school_id = $data['school_id'] ?? '';
        
        if (empty($students)) {
            echo json_encode(["error" => "لا توجد بيانات للاستيراد"]);
            break;
        }

        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare("INSERT INTO students (id, name, grade, section, school_id) VALUES (?, ?, ?, ?, ?)");
            foreach($students as $std) {
                $stmt->execute([
                    $std['id'] ?? uniqid(),
                    $std['name'],
                    $std['grade'],
                    $std['section'],
                    $school_id
                ]);
            }
            $conn->commit();
            echo json_encode(["success" => true, "count" => count($students)]);
        } catch(Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "حدث خطأ أثناء الاستيراد: " . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["message" => "نظام مدرستي - API يعمل بنجاح"]);
        break;
}
?>
