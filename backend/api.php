<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';
require_once 'models/AuthModel.php';
require_once 'models/EmployeeModel.php';
require_once 'models/DepartmentModel.php';
require_once 'models/PositionModel.php';
require_once 'models/SalaryModel.php';
require_once 'models/AttendanceModel.php';
require_once 'models/LeaveModel.php';
require_once 'models/PerformanceModel.php';

require_once 'controllers/AuthController.php';
require_once 'controllers/EmployeeController.php';
require_once 'controllers/DepartmentController.php';
require_once 'controllers/PositionController.php';
require_once 'controllers/SalaryController.php';
require_once 'controllers/AttendanceController.php';
require_once 'controllers/LeaveController.php';
require_once 'controllers/PerformanceController.php';

$method = $_SERVER['REQUEST_METHOD'];
$resource = $_GET['resource'] ?? $_POST['resource'] ?? null;
$id = $_GET['id'] ?? null;
$data = json_decode(file_get_contents('php://input'), true) ?? $_REQUEST;

try {
    if (!$resource) {
        echo json_encode(['error' => 'Resource parameter required']);
        exit;
    }

    switch ($resource) {
        case 'auth':
            $authCtrl = new AuthController(new AuthModel($pdo));
            if ($method === 'POST' && $data['action'] === 'login') {
                echo json_encode($authCtrl->login($data));
            } elseif ($method === 'POST' && $data['action'] === 'register') {
                echo json_encode($authCtrl->register($data));
            }
            break;

        case 'employees':
            $empCtrl = new EmployeeController(new EmployeeModel($pdo));
            if ($method === 'GET' && !$id) {
                echo json_encode($empCtrl->getAll());
            } elseif ($method === 'GET' && $id) {
                echo json_encode($empCtrl->getById($id));
            } elseif ($method === 'POST') {
                echo json_encode($empCtrl->create($data));
            } elseif ($method === 'PUT' && $id) {
                echo json_encode($empCtrl->update($id, $data));
            } elseif ($method === 'DELETE' && $id) {
                echo json_encode($empCtrl->delete($id));
            }
            break;

        case 'search-employees':
            $empCtrl = new EmployeeController(new EmployeeModel($pdo));
            echo json_encode($empCtrl->search($data));
            break;

        case 'departments':
            $deptCtrl = new DepartmentController(new DepartmentModel($pdo));
            if ($method === 'GET') {
                echo json_encode($deptCtrl->getAll());
            } elseif ($method === 'POST') {
                echo json_encode($deptCtrl->create($data));
            } elseif ($method === 'PUT' && $id) {
                echo json_encode($deptCtrl->update($id, $data));
            } elseif ($method === 'DELETE' && $id) {
                echo json_encode($deptCtrl->delete($id));
            }
            break;

        case 'positions':
            $posCtrl = new PositionController(new PositionModel($pdo));
            if ($method === 'GET') {
                echo json_encode($posCtrl->getAll());
            } elseif ($method === 'POST') {
                echo json_encode($posCtrl->create($data));
            } elseif ($method === 'PUT' && $id) {
                echo json_encode($posCtrl->update($id, $data));
            } elseif ($method === 'DELETE' && $id) {
                echo json_encode($posCtrl->delete($id));
            }
            break;

        case 'salary':
            $salaryCtrl = new SalaryController(new SalaryModel($pdo));
            if ($data['action'] === 'report') {
                echo json_encode($salaryCtrl->getPayrollReport());
            } elseif ($id) {
                echo json_encode($salaryCtrl->calculateNetSalary($id));
            }
            break;

        case 'attendance':
            $attCtrl = new AttendanceController(new AttendanceModel($pdo));
            if ($data['action'] === 'checkin') {
                echo json_encode($attCtrl->checkIn($data));
            } elseif ($data['action'] === 'checkout') {
                echo json_encode($attCtrl->checkOut($data));
            } elseif ($data['action'] === 'report' && $id) {
                echo json_encode($attCtrl->getReport($id, $data['from'] ?? date('Y-m-d'), $data['to'] ?? date('Y-m-d')));
            } elseif ($data['action'] === 'todaySummary') {
                echo json_encode($attCtrl->getTodayAttendanceSummary());
            }
            break;

        case 'leaves':
            $leaveCtrl = new LeaveController(new LeaveModel($pdo));
            if ($data['action'] === 'request') {
                echo json_encode($leaveCtrl->requestLeave($data));
            } elseif ($data['action'] === 'approve') {
                echo json_encode($leaveCtrl->approveLeave($data));
            } elseif ($data['action'] === 'balance' && $id) {
                echo json_encode($leaveCtrl->getLeaveBalance($id));
            } elseif ($method === 'GET') {
                echo json_encode($leaveCtrl->getPendingLeaves());
            }
            break;

        case 'performance':
            $perfCtrl = new PerformanceController(new PerformanceModel($pdo));
            if ($method === 'POST' && !empty($data['action']) && $data['action'] === 'add') {
                echo json_encode($perfCtrl->addReview($data));
            } elseif ($method === 'GET' && $id) {
                echo json_encode($perfCtrl->getAverageRating($id));
            } elseif ($method === 'GET' && !$id) {
                echo json_encode($perfCtrl->getEmployeePerformanceList());
            } else {
                echo json_encode(['error' => 'Invalid performance API call']);
            }
            break;

        default:
            echo json_encode(['error' => 'Resource không tồn tại']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
