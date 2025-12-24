<?php
// controllers/LeaveController.php
class LeaveController
{
    private $leaveModel;

    public function __construct($leaveModel)
    {
        $this->leaveModel = $leaveModel;
    }

    public function requestLeave($data)
    {
        if (empty($data['employee_id']) || empty($data['start_date']) || empty($data['end_date'])) {
            return ['error' => 'Dữ liệu không hợp lệ'];
        }

        if (strtotime($data['start_date']) > strtotime($data['end_date'])) {
            return ['error' => 'Ngày kết thúc phải sau ngày bắt đầu'];
        }

        return $this->leaveModel->requestLeave(
            $data['employee_id'],
            $data['start_date'],
            $data['end_date'],
            $data['type'] ?? 'annual',
            $data['reason'] ?? ''
        );
    }

    public function approveLeave($data)
    {
        if (empty($data['leave_id'])) {
            return ['error' => 'Leave ID bắt buộc'];
        }
        return $this->leaveModel->approveLeave($data['leave_id']);
    }

    public function getLeaveBalance($employeeId)
    {
        return $this->leaveModel->getLeaveBalance($employeeId);
    }

    public function getPendingLeaves()
    {
        return $this->leaveModel->getAll();
    }

    // New method to get summary of employees with leave count
    public function getLeaveSummary()
    {
        return $this->leaveModel->getLeaveSummary();
    }
}

