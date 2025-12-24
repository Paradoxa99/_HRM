<?php
// controllers/SalaryController.php
class SalaryController
{
    private $salaryModel;

    public function __construct($salaryModel)
    {
        $this->salaryModel = $salaryModel;
    }

    public function calculateNetSalary($employeeId)
    {
        return $this->salaryModel->calculateNetSalary($employeeId);
    }

    public function getPayrollReport()
    {
        return $this->salaryModel->generatePayrollReport();
    }

    public function updateSalaryBonus($id, $data)
    {
        if (!isset($data['bonus']) || !isset($data['deduction'])) {
            return ['error' => 'Dữ liệu không hợp lệ'];
        }
        return $this->salaryModel->updateSalaryBonus($id, $data['bonus'], $data['deduction']);
    }
}
