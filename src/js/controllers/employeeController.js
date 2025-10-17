import { addEmployee, getAllEmployees, deleteEmployee as deleteEmployeeModel } from '../models/employee.js';
import { getAllDepartments } from '../models/department.js';

export class EmployeeController {
    constructor() {
        this.employees = [];
    }

    // Basic bridge methods (not strictly required by the UI module)
    async getTotalEmployees() {
        const employees = getAllEmployees();
        return employees.length;
    }

    async getEmployees() {
        return getAllEmployees();
    }

    async addEmployee(employee) {
        // delegate to model
        return addEmployee(employee);
    }

    async deleteEmployee(id) {
        return deleteEmployeeModel(id);
    }
}

export async function initEmployeeModule(containerSelector) {
    // Prefer a dedicated '#content' container used by the SPA; fallback to
    // a page-specific container (e.g. '.content') or document.body so the
    // module also works on standalone pages like src/pages/employees.html
    const content = document.getElementById('content') || document.querySelector(containerSelector || '.content') || document.body;
    content.innerHTML = `
        <div class="module-container">
            <h2>Quản Lý Nhân Viên</h2>
            <form id="employeeForm" class="employee-form">
                <div class="form-group">
                    <label for="firstName">Tên:</label>
                    <input type="text" id="firstName" required>
                </div>
                <div class="form-group">
                    <label for="lastName">Họ:</label>
                    <input type="text" id="lastName" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="phone">Số điện thoại:</label>
                    <input type="tel" id="phone" required>
                </div>
                <div class="form-group">
                    <label for="department">Phòng ban:</label>
                    <select id="department" required>
                        <option value="">Chọn phòng ban</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary">Thêm Nhân Viên</button>
            </form>
            <div class="employee-list">
                <h3>Danh Sách Nhân Viên</h3>
                <table id="employeeTable">
                    <thead>
                        <tr>
                            <th>Họ và Tên</th>
                            <th>Email</th>
                            <th>Phòng Ban</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;

    // On full-page employees.html the form id is '#addEditEmployeeForm' inside '#employeeForm'
    const pageForm = document.getElementById('addEditEmployeeForm') || document.getElementById('employeeForm');
    const form = pageForm || document.getElementById('employeeForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
        e.preventDefault();
            const employee = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone') ? document.getElementById('phone').value : '',
                departmentId: document.getElementById('department') ? document.getElementById('department').value : ''
            };
        try {
            // use model addEmployee
            addEmployee(employee);
            form.reset();
            await renderEmployees();
        } catch (error) {
            alert(error.message || 'Có lỗi khi thêm nhân viên');
        }
        });
    }

    // Populate department select(s)
    function populateDepartmentSelects() {
        const departments = getAllDepartments() || [];
        const selects = Array.from(document.querySelectorAll('select#department'));
        selects.forEach(sel => {
            // clear existing (preserve first placeholder if present)
            const placeholder = sel.querySelector('option[value=""]') ? sel.querySelector('option[value=""]').outerHTML : '<option value="">Chọn phòng ban</option>';
            sel.innerHTML = placeholder + departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        });
    }

    populateDepartmentSelects();

    // expose delete function to global scope for inline handlers (keeps minimal change)
    window.deleteEmployee = async function (id) {
        deleteEmployeeModel(id);
        await renderEmployees();
    };

    // Toggle form visibility for standalone page
    const addBtn = document.getElementById('addEmployeeBtn');
    const formContainer = document.getElementById('employeeForm');
    const cancelBtn = document.getElementById('cancelBtn');
    if (addBtn && formContainer) {
        addBtn.addEventListener('click', () => {
            formContainer.classList.remove('hidden');
            // focus first input if present
            const first = formContainer.querySelector('input, select, textarea');
            if (first) first.focus();
        });
    }
    if (cancelBtn && formContainer) {
        cancelBtn.addEventListener('click', () => {
            formContainer.classList.add('hidden');
        });
    }

    await renderEmployees();
}

async function renderEmployees() {
    const employees = getAllEmployees() || [];
    const departments = getAllDepartments() || [];
    // Match pages: use #employeeTable (SPA) or #employeesTable (standalone page)
    const tbody = document.querySelector('#employeeTable tbody') || document.querySelector('#employeesTable tbody');
    if (!tbody) return;

    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Không có nhân viên</td></tr>';
        return;
    }

    tbody.innerHTML = employees.map(emp => {
        const dept = departments.find(d => d.id === emp.departmentId);
        const deptName = dept ? dept.name : '';
        return `
        <tr>
            <td>${emp.firstName} ${emp.lastName}</td>
            <td>${emp.email || ''}</td>
            <td>${deptName}</td>
            <td><button class="delete-btn" data-id="${emp.id}">Xóa</button></td>
        </tr>
    `;
    }).join('');

    // attach event listeners for delete
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteEmployeeModel(id);
            await renderEmployees();
        });
    });
}
