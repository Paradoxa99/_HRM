<?php
// controllers/EmployeeController.php
class EmployeeController extends BaseController
{
    private $employeeModel;

    public function __construct($employeeModel)
    {
        $this->employeeModel = $employeeModel;
    }

    public function getAll()
    {
        return $this->employeeModel->getAll();
    }

    public function getById($id)
    {
        return $this->employeeModel->getById($id);
    }

    public function create($data)
    {
        if (empty($data['name']) || empty($data['salary']) || $data['salary'] <= 0) {
            return ['error' => 'Dữ liệu không hợp lệ'];
        }

        return $this->employeeModel->create($data);
    }

    public function update($id, $data)
    {
        if (empty($data['name']) || $data['salary'] <= 0) {
            return ['error' => 'Dữ liệu không hợp lệ'];
        }

        return $this->employeeModel->update($id, $data);
    }

    public function delete($id)
    {
        return $this->employeeModel->delete($id) ? ['success' => true] : ['error' => 'Xóa thất bại'];
    }

    public function search($filters)
    {
        return $this->employeeModel->search($filters);
    }
}
