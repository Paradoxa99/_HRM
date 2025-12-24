<?php
// models/EmployeeModel.php
class EmployeeModel extends BaseModel
{
    public function __construct($pdo)
    {
        parent::__construct($pdo, 'employees');
    }

    public function create($data)
    {
        $sql = "INSERT INTO employees (name, department_id, position_id, salary, hire_date, email, phone)
                VALUES (:name, :dept_id, :pos_id, :salary, :hire_date, :email, :phone)";
        $stmt = $this->pdo->prepare($sql);

        try {
            $stmt->execute([
                ':name' => $data['name'] ?? '',
                ':dept_id' => $data['department_id'] ?? 0,
                ':pos_id' => $data['position_id'] ?? 0,
                ':salary' => $data['salary'] ?? 0,
                ':hire_date' => $data['hire_date'] ?? date('Y-m-d'),
                ':email' => $data['email'] ?? '',
                ':phone' => $data['phone'] ?? ''
            ]);
            return ['success' => true, 'id' => $this->pdo->lastInsertId()];
        } catch (PDOException $e) {
            return ['error' => 'Lỗi thêm nhân viên: ' . $e->getMessage()];
        }
    }

    public function update($id, $data)
    {
        $sql = "UPDATE employees SET name = :name, department_id = :dept_id, position_id = :pos_id,
                salary = :salary, bonus = :bonus, deduction = :deduction, hire_date = :hire_date
                WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        try {
            $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'] ?? '',
                ':dept_id' => $data['department_id'] ?? 0,
                ':pos_id' => $data['position_id'] ?? 0,
                ':salary' => $data['salary'] ?? 0,
                ':bonus' => $data['bonus'] ?? 0,
                ':deduction' => $data['deduction'] ?? 0,
                ':hire_date' => $data['hire_date'] ?? date('Y-m-d')
            ]);
            return ['success' => true];
        } catch (PDOException $e) {
            return ['error' => 'Lỗi cập nhật: ' . $e->getMessage()];
        }
    }

    public function search($filters)
    {
        $sql = "SELECT e.*, d.name as department_name, p.title as position_title
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                LEFT JOIN positions p ON e.position_id = p.id
                WHERE 1=1";
        $params = [];

        if (!empty($filters['name'])) {
            $sql .= " AND e.name LIKE :name";
            $params[':name'] = '%' . $filters['name'] . '%';
        }
        if (!empty($filters['department_id'])) {
            $sql .= " AND e.department_id = :dept_id";
            $params[':dept_id'] = $filters['department_id'];
        }
        if (!empty($filters['min_salary'])) {
            $sql .= " AND e.salary >= :min_salary";
            $params[':min_salary'] = $filters['min_salary'];
        }
        if (!empty($filters['max_salary'])) {
            $sql .= " AND e.salary <= :max_salary";
            $params[':max_salary'] = $filters['max_salary'];
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
