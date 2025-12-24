<?php
// models/AuthModel.php
class AuthModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function register($username, $password)
    {
        if (strlen($password) < 6 || strpos($password, ' ') !== false) {
            return ['error' => 'Password phải có ít nhất 6 ký tự, không chứa khoảng trắng'];
        }

        $sql = "SELECT id FROM users WHERE username = :username";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':username' => $username]);

        if ($stmt->fetch()) {
            return ['error' => 'Username đã tồn tại'];
        }

        // Lưu bcrypt hash
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $sql = "INSERT INTO users (username, password, role) VALUES (:username, :password, 'manager')";
        $stmt = $this->pdo->prepare($sql);

        if ($stmt->execute([':username' => $username, ':password' => $hashed])) {
            return ['success' => true, 'message' => 'Đăng ký thành công'];
        }
        return ['error' => 'Lỗi đăng ký'];
    }

    public function login($username, $password)
    {
        $sql = "SELECT id, username, role, password FROM users WHERE username = :username";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['error' => 'Username không tồn tại'];
        }

        // Trim khoảng trắng thừa từ mật khẩu lưu trong CSDL và mật khẩu nhập vào
        $storedPassword = trim($user['password']);
        $inputPassword = trim($password);

        // Kiểm tra mật khẩu bằng password_verify
        if (!password_verify($inputPassword, $storedPassword)) {
            return ['error' => 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.'];
        }

        $token = bin2hex(random_bytes(32));
        return [
            'success' => true,
            'token' => $token,
            'user' => ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role']]
        ];
    }
}
