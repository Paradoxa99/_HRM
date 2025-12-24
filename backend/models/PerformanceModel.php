<?php
// models/PerformanceModel.php
class PerformanceModel extends BaseModel
{
    public function __construct($pdo)
    {
        parent::__construct($pdo, 'reviews');
    }

    public function addReview($employeeId, $rating, $feedback)
    {
        if ($rating < 1 || $rating > 5) {
            return ['error' => 'Rating phải từ 1 đến 5'];
        }

        $sql = "INSERT INTO reviews (employee_id, rating, feedback, review_date)
                VALUES (:emp_id, :rating, :feedback, :date)";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([
            ':emp_id' => $employeeId,
            ':rating' => $rating,
            ':feedback' => $feedback,
            ':date' => date('Y-m-d')
        ])) {
            return ['success' => true];
        }
        return ['error' => 'Lỗi thêm đánh giá'];
    }

    public function getAverageRating($employeeId)
    {
        $sql = "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
                FROM reviews WHERE employee_id = :emp_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':emp_id' => $employeeId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getTopPerformers()
    {
        $sql = "SELECT e.id, e.name, AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
                FROM employees e
                LEFT JOIN reviews r ON e.id = r.employee_id
                GROUP BY e.id, e.name
                ORDER BY avg_rating DESC
                LIMIT 10";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getReviewsByEmployee($employeeId)
    {
        $sql = "SELECT * FROM reviews WHERE employee_id = :emp_id ORDER BY review_date DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':emp_id' => $employeeId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // New method for full employee list with performance info and sorting
    public function getEmployeePerformanceList($sortField = 'avg_rating', $sortOrder = 'DESC')
    {
        $allowedSortFields = ['avg_rating', 'review_count', 'name'];
        $allowedSortOrder = ['ASC', 'DESC'];

        // Validate inputs
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'avg_rating';
        }
        if (!in_array(strtoupper($sortOrder), $allowedSortOrder)) {
            $sortOrder = 'DESC';
        }

        $sql = "
            SELECT e.id, e.name,
                COALESCE(AVG(r.rating), 0) AS avg_rating,
                COUNT(r.id) AS review_count
            FROM employees e
            LEFT JOIN reviews r ON e.id = r.employee_id
            GROUP BY e.id, e.name
            ORDER BY $sortField $sortOrder
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get all reviews with optional search and pagination
    public function getAllReviews($search = '', $limit = 20, $offset = 0)
    {
        $searchSql = '';
        $params = [];

        if ($search !== '') {
            $searchSql = "WHERE e.name LIKE :search OR r.feedback LIKE :search";
            $params[':search'] = '%' . $search . '%';
        }

        $sql = "
            SELECT r.id, r.employee_id, e.name, r.rating, r.feedback, r.review_date
            FROM reviews r
            JOIN employees e ON r.employee_id = e.id
            $searchSql
            ORDER BY r.review_date DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->pdo->prepare($sql);
        // Bind limit and offset as integers
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
        $stmt->execute();

        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Count total matching rows for pagination
        $countSql = "SELECT COUNT(*) FROM reviews r JOIN employees e ON r.employee_id = e.id " . ($search !== '' ? $searchSql : '');
        $countStmt = $this->pdo->prepare($countSql);
        if ($search !== '') {
            $countStmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
        }
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        return ['reviews' => $reviews, 'total' => $total];
    }
}
