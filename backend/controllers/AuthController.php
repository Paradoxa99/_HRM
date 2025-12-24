<?php
// controllers/AuthController.php
class AuthController extends BaseController
{
    private $authModel;

    public function __construct($authModel)
    {
        $this->authModel = $authModel;
    }

    public function register($data)
    {
        if (empty($data['username']) || empty($data['password']) || empty($data['password_confirm'])) {
            return ['error' => 'Tất cả trường bắt buộc'];
        }

        if ($data['password'] !== $data['password_confirm']) {
            return ['error' => 'Password không khớp'];
        }

        return $this->authModel->register($data['username'], $data['password']);
    }

    public function login($data)
    {
        if (empty($data['username']) || empty($data['password'])) {
            return ['error' => 'Username và password bắt buộc'];
        }

        sleep(1); // Giả lập delay
        return $this->authModel->login($data['username'], $data['password']);
    }
}
