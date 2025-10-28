// Import tất cả module
import { AuthModule } from './modules/authModule.js';
import { EmployeeDbModule } from './modules/employeeDbModule.js';
import { EmployeeManagementModule } from './modules/employeeManagementModule.js';
import { DepartmentModule } from './modules/departmentModule.js';
import { PositionModule } from './modules/positionModule.js';
import { SalaryModule } from './modules/salaryModule.js';
import { AttendanceModule } from './modules/attendanceModule.js';
import { LeaveModule } from './modules/leaveModule.js';
import { PerformanceModule } from './modules/performanceModule.js';

// Import SearchEmployeeModule
import { SearchEmployeeModule } from './modules/searchEmployeeModule.js';

// Object chứa tất cả module để routing - ánh xạ tên module với đối tượng module tương ứng
const modules = {
    auth: AuthModule,
    employee: EmployeeManagementModule,
    searchEmployee: SearchEmployeeModule,
    department: DepartmentModule,
    position: PositionModule,
    salary: SalaryModule,
    attendance: AttendanceModule,
    leave: LeaveModule,
    performance: PerformanceModule
};

// Hàm khởi tạo dữ liệu mặc định - tạo dữ liệu mẫu nếu chưa có trong localStorage
function initDefaultData() {
    // Hàm tạo mã phòng ban
function generateDepartmentCode(deptName) {
    const words = deptName.split(' ');
    let code = '';
    for (let i = 0; i < Math.min(2, words.length); i++) {
        code += words[i].charAt(0).toUpperCase();
    }
    // Nếu trùng với ID đã có, thêm ký tự từ chữ tiếp theo
    let existingCodes = JSON.parse(localStorage.getItem('departments') || '[]').map(d => d.id);
    let uniqueCode = code;
    let index = 2;
    while (existingCodes.includes(uniqueCode)) {
        if (index < words.length) {
            uniqueCode += words[index].charAt(0).toUpperCase();
            index++;
        } else {
            // Nếu hết chữ, thêm số
            uniqueCode += '1';
        }
    }
    return uniqueCode;
}

    // Hàm tạo ID nhân viên mẫu
    function generateSampleEmployeeId(deptId, index) {
        const depts = [
            { id: '1', name: 'IT' },
            { id: '2', name: 'HR' }
        ];
        const dept = depts.find(d => d.id === deptId);
        const code = generateDepartmentCode(dept.name);
        return code + (100000 + index).toString();
    }

    // Khởi tạo danh sách nhân viên mẫu
    if (!localStorage.getItem('employees')) {
        const defaultEmployees = [
            { id: generateSampleEmployeeId('1', 1), name: 'John Doe', departmentId: '1', positionId: '1', salary: 50000, hireDate: '2020-01-01', bonus: 0, deduction: 0 },
            { id: generateSampleEmployeeId('1', 2), name: 'Jane Smith', departmentId: '1', positionId: '2', salary: 60000, hireDate: '2019-05-15', bonus: 5000, deduction: 1000 },
            { id: generateSampleEmployeeId('2', 3), name: 'Bob Johnson', departmentId: '2', positionId: '1', salary: 55000, hireDate: '2021-03-10', bonus: 2000, deduction: 500 },
            { id: generateSampleEmployeeId('2', 4), name: 'Alice Brown', departmentId: '2', positionId: '2', salary: 65000, hireDate: '2018-11-20', bonus: 3000, deduction: 0 },
            { id: generateSampleEmployeeId('1', 5), name: 'Charlie Wilson', departmentId: '1', positionId: '1', salary: 52000, hireDate: '2022-07-05', bonus: 1000, deduction: 200 }
        ];
        localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }
    // Khởi tạo danh sách phòng ban mẫu
    if (!localStorage.getItem('departments')) {
        const defaultDepartments = [
            { id: '1', name: 'IT', managerId: '1' },
            { id: '2', name: 'HR', managerId: '2' }
        ];
        localStorage.setItem('departments', JSON.stringify(defaultDepartments));
    }
    // Khởi tạo danh sách vị trí công việc mẫu
    if (!localStorage.getItem('positions')) {
        const defaultPositions = [
            { id: '1', title: 'Developer', description: 'Software development', salaryBase: 50000 },
            { id: '2', title: 'Manager', description: 'Team management', salaryBase: 60000 }
        ];
        localStorage.setItem('positions', JSON.stringify(defaultPositions));
    }
    // Khởi tạo danh sách người dùng với tài khoản admin mặc định
    if (!localStorage.getItem('users')) {
        const defaultUsers = [{ username: 'admin', hashedPassword: AuthModule.hashPassword('password123'), role: 'admin' }];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    // Khởi tạo dữ liệu điểm danh rỗng
    if (!localStorage.getItem('attendance')) {
        localStorage.setItem('attendance', JSON.stringify([]));
    }
    // Khởi tạo dữ liệu nghỉ phép rỗng
    if (!localStorage.getItem('leaves')) {
        localStorage.setItem('leaves', JSON.stringify([]));
    }
    // Khởi tạo dữ liệu đánh giá hiệu suất rỗng
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
    }
}

// Hàm render navbar - hiển thị thanh điều hướng với các nút chức năng
function renderNavbar() {
    const navbar = document.getElementById('navbar');
    navbar.innerHTML = `
        <button data-module="employee">Nhân Viên</button>
        <button data-module="searchEmployee">Tìm Kiếm</button>
        <button data-module="department">Quản Lý Phòng Ban</button>
        <button data-module="position">Quản Lý Vị Trí</button>
        <button data-module="salary">Quản Lý Lương</button>
        <button data-module="attendance">Chấm Công</button>
        <button data-module="leave">Quản Lý Nghỉ Phép</button>
        <button data-module="performance">Đánh Giá Hiệu Suất</button>
        <button id="logout">Đăng Xuất</button>
    `;
    navbar.style.display = 'block';
    // Thêm event listener cho các nút trong navbar
    navbar.addEventListener('click', (e) => {
        if (e.target.dataset.module) {
            // Render module tương ứng khi click vào nút
            modules[e.target.dataset.module].render();
        } else if (e.target.id === 'logout') {
            // Xử lý đăng xuất
            window.dispatchEvent(new Event('logout'));
            localStorage.removeItem('session');
            AuthModule.render();
        }
    });
}

// Hàm ẩn navbar - ẩn thanh điều hướng
function hideNavbar() {
    const navbar = document.getElementById('navbar');
    navbar.style.display = 'none';
}

// Hàm refresh dashboard - làm mới bảng điều khiển chính
function refreshDashboard() {
    window.dispatchEvent(new Event('refresh'));
}

// Hàm kiểm tra auth - kiểm tra xem người dùng đã đăng nhập chưa
function checkAuth() {
    const session = localStorage.getItem('session');
    if (!session) return false;
    try {
        const token = JSON.parse(session);
        return token.expiry > Date.now();
    } catch {
        return false;
    }
}

// Hàm khởi tạo ứng dụng - hàm chính để khởi động ứng dụng
function init() {
    initDefaultData();
    if (checkAuth()) {
        // Nếu đã đăng nhập, hiển thị navbar và trang chính
        renderNavbar();
        EmployeeManagementModule.render();
    } else {
        // Nếu chưa đăng nhập, ẩn navbar và hiển thị trang đăng nhập
        hideNavbar();
        AuthModule.render();
    }
    // Lắng nghe sự kiện refresh để cập nhật dashboard
    window.addEventListener('refresh', () => {
        EmployeeManagementModule.render();
    });
    // Lắng nghe sự kiện login để hiển thị navbar
    window.addEventListener('login', () => {
        renderNavbar();
    });
    // Lắng nghe sự kiện logout để ẩn navbar
    window.addEventListener('logout', () => {
        hideNavbar();
    });
}

// Xử lý lỗi toàn cục - bắt và xử lý các lỗi không mong muốn
window.onerror = (msg, url, line) => {
    console.error(`Error: ${msg} at ${url}:${line}`);
    alert('Đã xảy ra lỗi. Vui lòng tải lại trang.');
};

// Gắn event khi load trang - khởi động ứng dụng khi trang được tải
window.addEventListener('load', init);
