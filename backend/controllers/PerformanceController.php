<?php
// controllers/PerformanceController.php
class PerformanceController
{
    private $performanceModel;

    public function __construct($performanceModel)
    {
        $this->performanceModel = $performanceModel;
    }

    public function addReview($data)
    {
        if (empty($data['employee_id']) || empty($data['rating']) || empty($data['feedback'])) {
            return ['error' => 'Dữ liệu không hợp lệ'];
        }

        return $this->performanceModel->addReview(
            $data['employee_id'],
            $data['rating'],
            $data['feedback']
        );
    }

    public function getAverageRating($employeeId)
    {
        return $this->performanceModel->getAverageRating($employeeId);
    }

    public function getEmployeePerformanceList($sortField = 'avg_rating', $sortOrder = 'DESC')
    {
        return $this->performanceModel->getEmployeePerformanceList($sortField, $sortOrder);
    }
}
