<?php
// controllers/AttendanceController.php
class AttendanceController
{
    private $attendanceModel;

    public function __construct($attendanceModel)
    {
        $this->attendanceModel = $attendanceModel;
    }

    public function checkIn($data)
    {
        if (empty($data['employee_id'])) {
            return ['error' => 'Employee ID bắt buộc'];
        }
        return $this->attendanceModel->checkIn($data['employee_id']);
    }

    public function checkOut($data)
    {
        if (empty($data['employee_id'])) {
            return ['error' => 'Employee ID bắt buộc'];
        }
        return $this->attendanceModel->checkOut($data['employee_id']);
    }

    public function getReport($employeeId, $from, $to)
    {
        return $this->attendanceModel->getReport($employeeId, $from, $to);
    }

    // New method to get attendance summary of employees for today
    public function getTodayAttendanceSummary()
    {
        return $this->attendanceModel->getTodayAttendanceSummary();
    }
}
