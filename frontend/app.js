// app.js - Main application file
import auth from './modules/authModule.js';
import addEmp from './modules/addEmployeeModule.js';
import editEmp from './modules/editEmployeeModule.js';
import deleteEmp from './modules/deleteEmployeeModule.js';
import searchEmp from './modules/searchEmployeeModule.js';
import { departmentUI } from './modules/departmentModule.js';
import { positionUI } from './modules/positionModule.js';
import { salaryUI } from './modules/salaryModule.js';
import { attendanceUI } from './modules/attendanceModule.js';
import { leaveUI } from './modules/leaveModule.js';
import performanceUI from './modules/performanceModule.js';

class App {
    constructor() {
        this.currentUser = null;
        this.modules = {
            'add-employee': addEmp,
            'edit-employee': editEmp,
            'delete-employee': deleteEmp,
            'search-employee': searchEmp,
            'departments': { render: (c) => departmentUI.render(c) },
            'positions': { render: (c) => positionUI.render(c) },
            'salary': { render: (c) => salaryUI.render(c) },
            'attendance': { render: (c) => attendanceUI.render(c) },
            'leaves': { render: (c) => leaveUI.render(c) },
            'performance': { render: (c) => performanceUI.render(c) }
        };
    }

    init() {
        if (auth.isAuthenticated()) {
            this.currentUser = auth.getUser();
            this.showDashboard();
        } else {
            this.showAuthForm();
        }
    }

    showAuthForm() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-form">
                    <h1>HRM System</h1>
                    <div id="authTabs">
                        <button id="loginTab" class="tab-btn active">Đăng nhập</button>
                        <button id="registerTab" class="tab-btn">Đăng ký</button>
                    </div>

                    <form id="loginForm">
                        <input type="text" id="username" placeholder="Username" required>
                        <div style="display:flex;align-items:center;margin:5px 0;">
                            <input type="password" id="password" placeholder="Password" required style="flex-grow:1;">
                            <input type="checkbox" id="showPassword" style="margin-left:5px;">
                            <label for="showPassword" style="margin-left:2px;user-select:none;">Hiện mật khẩu</label>
                        </div>
                        <button type="submit">Đăng nhập</button>
                    </form>

                    <form id="registerForm" style="display:none;">
                        <input type="text" id="regUsername" placeholder="Username" required>
                        <input type="password" id="regPassword" placeholder="Password (min 6)" required>
                        <input type="password" id="regPassword2" placeholder="Xác nhận Password" required>
                        <button type="submit">Đăng ký</button>
                    </form>

                    <div id="authMsg"></div>
                </div>
            </div>
        `;

        document.getElementById('loginTab').addEventListener('click', () => this.switchTab('login'));
        document.getElementById('registerTab').addEventListener('click', () => this.switchTab('register'));
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Short and simple show password toggle
        document.getElementById('showPassword').onchange = function () {
            document.getElementById('password').type = this.checked ? 'text' : 'password';
        };
    }

    switchTab(tab) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');

        if (tab === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const result = await auth.login(username, password);
        if (result.success) {
            this.showAuthMessage('Đăng nhập thành công', 'success');
            setTimeout(() => this.init(), 1500);
        } else {
            this.showAuthMessage(result.error || 'Lỗi đăng nhập', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const password2 = document.getElementById('regPassword2').value;

        const result = await auth.register(username, password, password2);
        if (result.success) {
            this.showAuthMessage('Đăng ký thành công, vui lòng đăng nhập', 'success');
            setTimeout(() => this.switchTab('login'), 1500);
        } else {
            this.showAuthMessage(result.error || 'Lỗi đăng ký', 'error');
        }
    }

    showAuthMessage(msg, type) {
        const msgEl = document.getElementById('authMsg');
        msgEl.textContent = msg;
        msgEl.className = `auth-message ${type}`;
        setTimeout(() => msgEl.textContent = '', 3000);
    }

    showDashboard() {
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="dashboard">
                <nav class="sidebar">
                    <div class="user-info">
                        <h3>${this.currentUser?.username}</h3>
                        <p>${this.currentUser?.role}</p>
                    </div>
                    <ul class="menu">
                        <li><a href="#" onclick="app.loadModule('dashboard')">Dashboard</a></li>
                        <li><strong>Nhân viên</strong></li>
                        <li><a href="#" onclick="app.loadModule('add-employee')">+ Thêm</a></li>
                        <li><a href="#" onclick="app.loadModule('edit-employee')">✎ Sửa</a></li>
                        <li><a href="#" onclick="app.loadModule('delete-employee')">✕ Xóa</a></li>
                        <li><a href="#" onclick="app.loadModule('search-employee')">🔍 Tìm kiếm</a></li>
                        <li><strong>Quản lý</strong></li>
                        <li><a href="#" onclick="app.loadModule('departments')">Phòng ban</a></li>
                        <li><a href="#" onclick="app.loadModule('positions')">Vị trí</a></li>
                        <li><strong>Lương & Chấm công</strong></li>
                        <li><a href="#" onclick="app.loadModule('salary')">💰 Lương</a></li>
                        <li><a href="#" onclick="app.loadModule('attendance')">⏰ Chấm công</a></li>
                        <li><strong>Nhân sự</strong></li>
                        <li><a href="#" onclick="app.loadModule('leaves')">Nghỉ phép</a></li>
                        <li><a href="#" onclick="app.loadModule('performance')">⭐ Hiệu suất</a></li>
                        <li><a href="#" onclick="app.handleLogout()" class="logout">Đăng xuất</a></li>
                    </ul>
                </nav>
                <main class="content">
                    <div id="contentArea"></div>
                </main>
            </div>
        `;
        this.loadModule('dashboard');
    }

    async loadModule(moduleName) {
        const contentArea = document.getElementById('contentArea');

        if (moduleName === 'dashboard') {
            contentArea.innerHTML = `
                <div class="dashboard-welcome">
                    <h2>Chào mừng đến HRM System</h2>
                    <p>Người dùng: <strong>${this.currentUser?.username}</strong></p>
                    <p>Vai trò: <strong>${this.currentUser?.role}</strong></p>
                    <p>Chọn một module từ menu bên trái để bắt đầu</p>
                </div>
            `;
            return;
        }

        const module = this.modules[moduleName];
        if (module && module.render) {
            await module.render(contentArea);
        }
    }

    handleLogout() {
        if (confirm('Xác nhận đăng xuất?')) {
            auth.logout();
            this.init();
        }
    }
}

const app = new App();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
