import { initEmployeeModule, EmployeeController } from './controllers/employeeController.js';
import { initDepartmentModule, DepartmentController } from './controllers/departmentController.js';
import { initAttendanceModule, AttendanceController } from './controllers/attendanceController.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize controllers
    const employeeCtrl = new EmployeeController();
    const departmentCtrl = new DepartmentController();
    const attendanceCtrl = new AttendanceController();

    // Khởi tạo menu events
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const target = event.target.getAttribute('data-target');
            loadPage(target);
        });
    });

    async function loadPage(page) {
        let content = document.getElementById('content');

        // If #content doesn't exist, create it in main
        if (!content) {
            const main = document.querySelector('main') || document.body;
            content = document.createElement('div');
            content.id = 'content';
            main.appendChild(content);
        }

        // Show loading state
        content.innerHTML = '<div class="loading">Loading...</div>';

        try {
            switch (page) {
                case 'dashboard':
                    await loadDashboard();
                    break;
                case 'employees':
                    await initEmployeeModule();
                    break;
                case 'departments':
                    await initDepartmentModule();
                    break;
                case 'attendance':
                    await initAttendanceModule();
                    break;
                default:
                    content.innerHTML = '<h1>Không tìm thấy trang</h1>';
            }
        } catch (error) {
            console.error('Error loading page:', error);
            content.innerHTML = `<div class="error">Có lỗi khi tải trang: ${error.message}</div>`;
        }
    }

    async function loadDashboard() {
        const content = document.getElementById('content');
        if (!content) {
            console.error('Dashboard container not found');
            return;
        }

        content.innerHTML = `
            <div class="dashboard-container">
                <h1>Hệ Thống Quản Lý Nhân Sự</h1>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Tổng Nhân Viên</h3>
                        <div class="stat-number" id="totalEmployees">0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Tổng Phòng Ban</h3>
                        <div class="stat-number" id="totalDepartments">0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Đi Làm Hôm Nay</h3>
                        <div class="stat-number" id="presentToday">0</div>
                    </div>
                </div>
            </div>
        `;

        try {
            const totalEmployees = await employeeCtrl.getTotalEmployees();
            const totalDepartments = await departmentCtrl.getTotalDepartments();
            const presentToday = await attendanceCtrl.getPresentToday();

            // Safe querySelector with null check
            const employeesEl = document.querySelector('#totalEmployees .stat-number');
            const departsEl = document.querySelector('#totalDepartments .stat-number');
            const presentEl = document.querySelector('#presentToday .stat-number');

            if (employeesEl) employeesEl.textContent = totalEmployees;
            if (departsEl) departsEl.textContent = totalDepartments;
            if (presentEl) presentEl.textContent = presentToday;
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    // Load trang mặc định
    loadPage('dashboard');
});
