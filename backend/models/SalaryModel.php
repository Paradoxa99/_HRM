<?php
// models/SalaryModel.php
class SalaryModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function calculateNetSalary($employeeId)
    {
        $sql = "SELECT salary, bonus, deduction FROM employees WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $employeeId]);
        $emp = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$emp) return ['error' => 'Nhân viên không tồn tại'];

        $net = $emp['salary'] + $emp['bonus'] - $emp['deduction'];
        return ['net_salary' => $net, 'details' => $emp];
    }

    public function generatePayrollReport()
    {
        $sql = "SELECT e.id, e.name, e.salary, e.bonus, e.deduction,
                (e.salary + e.bonus - e.deduction) as net_salary,
                d.name as department, p.title as position
                FROM employees e
                JOIN departments d ON e.department_id = d.id
                JOIN positions p ON e.position_id = p.id";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $payroll = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $total = array_reduce($payroll, fn($sum, $emp) => $sum + $emp['net_salary'], 0);

        return [
            'payroll' => $payroll,
            'total_payroll' => $total,
            'employee_count' => count($payroll)
        ];
    }

    public function updateSalaryBonus($employeeId, $bonus, $deduction)
    {
        $sql = "UPDATE employees SET bonus = :bonus, deduction = :deduction WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([':id' => $employeeId, ':bonus' => $bonus, ':deduction' => $deduction])) {
            return ['success' => true];
        }
        return ['error' => 'Lỗi cập nhật lương'];
    }
}
