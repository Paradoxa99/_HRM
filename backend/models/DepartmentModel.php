<?php
// models/DepartmentModel.php
class DepartmentModel extends BaseModel
{
    public function __construct($pdo)
    {
        parent::__construct($pdo, 'departments');
    }

    public function create($name)
    {
        $sql = "INSERT INTO departments (name) VALUES (:name)";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([':name' => $name])) {
            return ['success' => true, 'id' => $this->pdo->lastInsertId()];
        }
        return ['error' => 'Lỗi thêm phòng ban'];
    }

    public function update($id, $name)
    {
        $sql = "UPDATE departments SET name = :name WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([':id' => $id, ':name' => $name])) {
            return ['success' => true];
        }
        return ['error' => 'Lỗi cập nhật phòng ban'];
    }

    public function canDelete($id)
    {
        $sql = "SELECT COUNT(*) as count FROM employees WHERE department_id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] == 0;
    }
}
