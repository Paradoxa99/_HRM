<?php
// controllers/DepartmentController.php
class DepartmentController extends BaseController
{
    private $departmentModel;

    public function __construct($departmentModel)
    {
        $this->departmentModel = $departmentModel;
    }

    public function getAll()
    {
        return $this->departmentModel->getAll();
    }

    public function create($data)
    {
        if (empty($data['name'])) {
            return ['error' => 'Tên phòng ban bắt buộc'];
        }
        return $this->departmentModel->create($data['name']);
    }

    public function update($id, $data)
    {
        if (empty($data['name'])) {
            return ['error' => 'Tên phòng ban bắt buộc'];
        }
        return $this->departmentModel->update($id, $data['name']);
    }

    public function delete($id)
    {
        if (!$this->departmentModel->canDelete($id)) {
            return ['error' => 'Phòng ban có nhân viên, không thể xóa'];
        }
        return $this->departmentModel->delete($id) ? ['success' => true] : ['error' => 'Xóa thất bại'];
    }
}
