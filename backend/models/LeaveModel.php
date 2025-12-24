<?php
// models/LeaveModel.php
class LeaveModel extends BaseModel
{
    public function __construct($pdo)
    {
        parent::__construct($pdo, 'leaves');
    }

    public function requestLeave($employeeId, $startDate, $endDate, $type, $reason = '')
    {
        $sql = "SELECT COUNT(*) as count FROM leaves WHERE employee_id = :emp_id
                AND ((start_date <= :end AND end_date >= :start) AND status = 'approved')";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':emp_id' => $employeeId,
            ':start' => $startDate,
            ':end' => $endDate
        ]);

        if ($stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0) {
            return ['error' => 'Thời gian này đã được phê duyệt nghỉ'];
        }

        $sql = "INSERT INTO leaves (employee_id, start_date, end_date, type, reason)
                VALUES (:emp_id, :start, :end, :type, :reason)";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([
            ':emp_id' => $employeeId,
            ':start' => $startDate,
            ':end' => $endDate,
            ':type' => $type,
            ':reason' => $reason
        ])) {
            return ['success' => true, 'id' => $this->pdo->lastInsertId()];
        }
        return ['error' => 'Lỗi yêu cầu nghỉ phép'];
    }

    public function approveLeave($leaveId)
    {
        $sql = "UPDATE leaves SET status = 'approved' WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([':id' => $leaveId]) ? ['success' => true] : ['error' => 'Lỗi phê duyệt'];
    }

    public function getLeaveBalance($employeeId)
    {
        $sql = "SELECT SUM(DATEDIFF(end_date, start_date) + 1) as used_days
                FROM leaves WHERE employee_id = :emp_id AND type = 'annual' AND status = 'approved'";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':emp_id' => $employeeId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $usedDays = $result['used_days'] ?? 0;
        $remainingDays = 20 - $usedDays;

        return ['total_days' => 20, 'used_days' => $usedDays, 'remaining_days' => $remainingDays];
    }

    // New method to get leave summary per employee (count of leaves)
    public function getLeaveSummary()
    {
        $sql = "SELECT e.id, e.name, COUNT(l.id) as leave_count
                FROM employees e
                LEFT JOIN leaves l ON e.id = l.employee_id
                GROUP BY e.id, e.name
                ORDER BY leave_count DESC, e.name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
