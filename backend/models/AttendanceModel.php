<?php
// models/AttendanceModel.php
class AttendanceModel extends BaseModel
{
    public function __construct($pdo)
    {
        parent::__construct($pdo, 'attendance');
    }

    public function checkIn($employeeId)
    {
        $today = date('Y-m-d');
        $sql = "SELECT id FROM attendance WHERE employee_id = :emp_id AND attendance_date = :date";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':emp_id' => $employeeId, ':date' => $today]);

        if ($stmt->fetch()) {
            return ['error' => 'Đã check-in hôm nay'];
        }

        $sql = "INSERT INTO attendance (employee_id, check_in, attendance_date)
                VALUES (:emp_id, NOW(), :date)";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([':emp_id' => $employeeId, ':date' => $today])) {
            return ['success' => true];
        }
        return ['error' => 'Lỗi check-in'];
    }

    public function checkOut($employeeId)
    {
        $today = date('Y-m-d');
        $sql = "SELECT check_in FROM attendance WHERE employee_id = :emp_id AND attendance_date = :date";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':emp_id' => $employeeId, ':date' => $today]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return ['error' => 'Chưa check-in'];
        }

        $checkIn = strtotime($row['check_in']);
        $workHours = round((time() - $checkIn) / 3600, 2);

        $sql = "UPDATE attendance SET check_out = NOW(), work_hours = :hours
                WHERE employee_id = :emp_id AND attendance_date = :date";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([':emp_id' => $employeeId, ':hours' => $workHours, ':date' => $today])) {
            return ['success' => true, 'work_hours' => $workHours];
        }
        return ['error' => 'Lỗi check-out'];
    }

    public function getReport($employeeId, $from, $to)
    {
        $sql = "SELECT * FROM attendance WHERE employee_id = :emp_id
                AND attendance_date BETWEEN :from AND :to ORDER BY attendance_date DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':emp_id' => $employeeId, ':from' => $from, ':to' => $to]);

        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $totalHours = array_reduce($records, fn($sum, $r) => $sum + ($r['work_hours'] ?? 0), 0);

        return ['records' => $records, 'total_hours' => round($totalHours, 2)];
    }

    // New method to get attendance summary per employee for today
    public function getTodayAttendanceSummary()
    {
        $today = date('Y-m-d');
        $sql = "
            SELECT e.id, e.name, a.check_in, a.check_out, a.work_hours
            FROM employees e
            LEFT JOIN attendance a ON e.id = a.employee_id AND a.attendance_date = :today
            ORDER BY e.name ASC
        ";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':today' => $today]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
