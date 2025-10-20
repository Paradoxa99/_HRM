// Closure cho hash password - tạo hàm băm mật khẩu với salt cố định
const createHash = (() => {
    const salt = 'hrmSalt123';
    return (password) => btoa(password + salt);
})();

export const AuthModule = {
    // Hàm băm mật khẩu
    hashPassword(password) {
        return createHash(password);
    },

    // Hàm render giao diện đăng nhập/đăng ký
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <h2>Đăng nhập</h2>
            <form id="login-form">
                <input type="text" id="username" placeholder="Tên đăng nhập" required>
                <input type="password" id="password" placeholder="Mật khẩu" required>
                <button type="submit">Đăng nhập</button>
            </form>
            <p>Chưa có tài khoản? <button id="show-register">Đăng ký</button></p>
            <div id="register-form" style="display: none;">
                <h3>Đăng ký</h3>
                <form id="register-form-el">
                    <input type="text" id="reg-username" placeholder="Tên đăng nhập" required>
                    <input type="password" id="reg-password" placeholder="Mật khẩu" required>
                    <input type="password" id="reg-confirm" placeholder="Xác nhận mật khẩu" required>
                    <button type="submit">Đăng ký</button>
                </form>
            </div>
        `;
        // Gắn event listener cho form đăng nhập
        document.getElementById('login-form').addEventListener('submit', this.handleLogin.bind(this));
        // Hiển thị form đăng ký khi click nút
        document.getElementById('show-register').addEventListener('click', () => {
            document.getElementById('register-form').style.display = 'block';
        });
        // Gắn event listener cho form đăng ký
        document.getElementById('register-form-el').addEventListener('submit', this.handleRegister.bind(this));
    },

    // Hàm xử lý đăng nhập
    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        // Kiểm tra tính hợp lệ của username và password
        if (!username || password.length < 6 || /\s/.test(password)) {
            alert('Tên đăng nhập hoặc mật khẩu không hợp lệ');
            return;
        }
        // Giả lập thời gian xử lý
        await new Promise(resolve => setTimeout(resolve, 1500));
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log('Users in localStorage:', users);
        console.log('Entered username:', username);
        console.log('Entered password hash:', this.hashPassword(password));
        // Tìm user khớp với username và password đã băm
        const user = users.find(u => u.username === username && u.hashedPassword === this.hashPassword(password));
        console.log('Found user:', user);
        if (user) {
            // Tạo session token với thời hạn 1 giờ
            const token = { username, expiry: Date.now() + 3600000 };
            localStorage.setItem('session', JSON.stringify(token));
            alert('Đăng nhập thành công');
            // Phát sự kiện login và refresh
            window.dispatchEvent(new Event('login'));
            window.dispatchEvent(new Event('refresh'));
        } else {
            alert('Thông tin đăng nhập không chính xác');
        }
    },

    // Hàm xử lý đăng ký
    handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        // Kiểm tra tính hợp lệ của thông tin đăng ký
        if (!username || users.some(u => u.username === username) || password !== confirm || password.length < 6 || /\s/.test(password)) {
            alert('Thông tin đăng ký không hợp lệ');
            return;
        }
        // Thêm user mới với role 'user'
        users.push({ username, hashedPassword: this.hashPassword(password), role: 'user' });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Đăng ký thành công. Vui lòng đăng nhập.');
        // Ẩn form đăng ký
        document.getElementById('register-form').style.display = 'none';
    },

    // Hàm đăng xuất
    logout() {
        localStorage.removeItem('session');
        this.render();
    }
};
