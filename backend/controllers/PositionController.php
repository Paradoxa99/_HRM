<?php
// controllers/PositionController.php
class PositionController extends BaseController
{
    private $positionModel;

    public function __construct($positionModel)
    {
        $this->positionModel = $positionModel;
    }

    public function getAll()
    {
        if (!empty($_GET['department_id'])) {
            return $this->positionModel->search(['department_id' => $_GET['department_id']]);
        }
        return $this->positionModel->getAll();
    }

    public function create($data)
    {
        if (empty($data['title'])) {
            return ['error' => 'Tiêu đề vị trí bắt buộc'];
        }
        return $this->positionModel->create(
            $data['title'],
            $data['description'] ?? '',
            $data['salary_base'] ?? 0,
            $data['department_id'] ?? null
        );
    }

    public function update($id, $data)
    {
        if (empty($data['title'])) {
            return ['error' => 'Tiêu đề vị trí bắt buộc'];
        }
        return $this->positionModel->update($id, $data);
    }

    public function delete($id)
    {
        return $this->positionModel->delete($id) ? ['success' => true] : ['error' => 'Xóa thất bại'];
    }
}
