<?php
// models/PositionModel.php
class PositionModel extends BaseModel
{
    public function __construct($pdo)
    {
        parent::__construct($pdo, 'positions');
    }

    public function search($filters)
    {
        $sql = "SELECT * FROM positions WHERE 1=1";
        $params = [];

        if (!empty($filters['department_id'])) {
            $sql .= " AND department_id = :dept_id";
            $params[':dept_id'] = $filters['department_id'];
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($title, $description, $salary_base, $department_id = null)
    {
        $sql = "INSERT INTO positions (title, description, salary_base, department_id) VALUES (:title, :desc, :salary, :dept_id)";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([':title' => $title, ':desc' => $description, ':salary' => $salary_base, ':dept_id' => $department_id])) {
            return ['success' => true, 'id' => $this->pdo->lastInsertId()];
        }
        return ['error' => 'Lỗi thêm vị trí'];
    }

    public function update($id, $data)
    {
        $sql = "UPDATE positions SET title = :title, description = :desc, salary_base = :salary, department_id = :dept_id WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([
            ':id' => $id,
            ':title' => $data['title'] ?? '',
            ':desc' => $data['description'] ?? '',
            ':salary' => $data['salary_base'] ?? 0,
            ':dept_id' => $data['department_id'] ?? null
        ])) {
            return ['success' => true];
        }
        return ['error' => 'Lỗi cập nhật vị trí'];
    }
}
