// editEmployeeModule.js - Sửa nhân viên
import employeeDb from './employeeDbModule.js';
import { departmentUI } from './departmentModule.js';
import { positionUI } from './positionModule.js';

class EditEmployeeModule {
    constructor() {
        this.container = null;
        this.currentEmployee = null;
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="form-wrapper">
                <h2>Sửa Nhân viên</h2>
                <div class="search-section">
                    <input type="text" id="searchId" placeholder="Nhập ID hoặc tên">
                    <button id="searchBtn">Tìm kiếm</button>
                </div>
                <form id="editEmployeeForm" style="display:none;">
                    <input type="hidden" id="empId">
                    <input type="text" id="empName" placeholder="Tên nhân viên" required>
                    <select id="empDept" required></select>
                    <select id="empPos" required></select>
                    <input type="number" id="empSalary" placeholder="Lương" min="0" step="0.01" required>
                    <input type="number" id="empBonus" placeholder="Thưởng" min="0" step="0.01">
                    <input type="number" id="empDeduction" placeholder="Khấu trừ" min="0" step="0.01">
                    <input type="date" id="empHireDate" required>
                    <button type="submit">Cập nhật</button>
                </form>
                <div id="msg"></div>
            </div>
        `;

        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('editEmployeeForm').addEventListener('submit', e => this.handleSubmit(e));
    }

    async handleSearch() {
        const search = document.getElementById('searchId').value.trim();
        if (!search) {
            this.showMessage('Nhập ID hoặc tên', 'error');
            return;
        }

        const employees = await employeeDb.getAllEmployees();
        const emp = employees.find(e => e.id == search || e.name.toLowerCase().includes(search.toLowerCase()));

        if (!emp) {
            this.showMessage('Không tìm thấy', 'error');
            return;
        }

        this.currentEmployee = emp;
        await this.loadForm();
        document.getElementById('editEmployeeForm').style.display = 'block';
    }

    async loadForm() {
        const departments = await departmentUI.deptModule.getAllDepartments();
        const positions = await positionUI.posModule.getAllPositions();

        document.getElementById('empId').value = this.currentEmployee.id;
        document.getElementById('empName').value = this.currentEmployee.name;
        document.getElementById('empDept').innerHTML = departments.map(d =>
            `<option value="${d.id}" ${d.id == this.currentEmployee.department_id ? 'selected' : ''}>${d.name}</option>`
        ).join('');
        document.getElementById('empPos').innerHTML = positions.map(p =>
            `<option value="${p.id}" ${p.id == this.currentEmployee.position_id ? 'selected' : ''}>${p.title}</option>`
        ).join('');
        document.getElementById('empSalary').value = this.currentEmployee.salary;
        document.getElementById('empBonus').value = this.currentEmployee.bonus != null ? this.currentEmployee.bonus : 1;
        document.getElementById('empDeduction').value = this.currentEmployee.deduction != null ? this.currentEmployee.deduction : 1;
        document.getElementById('empHireDate').value = this.currentEmployee.hire_date;
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!confirm('Xác nhận cập nhật?')) return;

        const data = {
            name: document.getElementById('empName').value.trim(),
            department_id: document.getElementById('empDept').value,
            position_id: document.getElementById('empPos').value,
            salary: parseFloat(document.getElementById('empSalary').value),
            bonus: parseFloat(document.getElementById('empBonus').value) || 0,
            deduction: parseFloat(document.getElementById('empDeduction').value) || 0,
            hire_date: document.getElementById('empHireDate').value
        };

        if (!data.name) {
            this.showMessage('Tên nhân viên không được để trống', 'error');
            return;
        }
        if (!data.department_id) {
            this.showMessage('Vui lòng chọn phòng ban', 'error');
            return;
        }
        if (!data.position_id) {
            this.showMessage('Vui lòng chọn vị trí', 'error');
            return;
        }
        if (isNaN(data.salary) || data.salary <= 0) {
            this.showMessage('Lương phải là số lớn hơn 0', 'error');
            return;
        }
        if (!data.hire_date) {
            this.showMessage('Vui lòng chọn ngày tuyển', 'error');
            return;
        }

        const result = await employeeDb.updateEmployee(this.currentEmployee.id, data);
        if (result.success) {
            this.showMessage('Cập nhật thành công', 'success');
        } else {
            this.showMessage(result.error || 'Lỗi cập nhật', 'error');
        }
    }

    showMessage(msg, type) {
        const msgEl = document.getElementById('msg');
        msgEl.textContent = msg;
        msgEl.className = `message ${type}`;
        setTimeout(() => msgEl.textContent = '', 3000);
    }
}

export default new EditEmployeeModule();
