// addEmployeeModule.js - Thêm nhân viên
import employeeDb from './employeeDbModule.js';
import { departmentUI } from './departmentModule.js';
import { positionUI } from './positionModule.js';

class AddEmployeeModule {
    constructor() {
        this.container = null;
    }

    async render(container) {
        this.container = container;
        this.allPositions = await positionUI.posModule.getAllPositions();
        const departments = await departmentUI.deptModule.getAllDepartments();

        this.container.innerHTML = `
            <div class="form-wrapper">
                <h2>Thêm Nhân viên Mới</h2>
                <form id="addEmployeeForm">
                    <input type="text" id="empName" placeholder="Tên nhân viên" required>
                    <select id="empDept" required>
                        <option value="">-- Chọn phòng ban --</option>
                        ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                    <select id="empPos" required>
                        <option value="">-- Chọn vị trí --</option>
                    </select>
                    <input type="number" id="empSalary" placeholder="Lương" min="0" step="0.01" required readonly>
                    <input type="date" id="empHireDate" required>
                    <input type="email" id="empEmail" placeholder="Email">
                    <input type="tel" id="empPhone" placeholder="Điện thoại">
                    <button type="submit">Thêm</button>
                </form>
                <div id="msg"></div>
            </div>
        `;

        document.getElementById('addEmployeeForm').addEventListener('submit', e => this.handleSubmit(e));

        // Add event listener for department select to filter positions
        document.getElementById('empDept').addEventListener('change', e => {
            const deptId = e.target.value;
            const posSelect = document.getElementById('empPos');
            posSelect.innerHTML = '<option value="">-- Chọn vị trí --</option>';

            if (deptId) {
                const filteredPositions = this.allPositions.filter(p => p.department_id == deptId);
                filteredPositions.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id;
                    option.textContent = p.title;
                    option.setAttribute('data-salary', p.salary_base);
                    posSelect.appendChild(option);
                });
            }

            // Trigger change event on position select to update salary
            posSelect.dispatchEvent(new Event('change'));
        });

        // Add event listener for position select to update salary input based on selected position
        document.getElementById('empPos').addEventListener('change', e => {
            const select = e.target;
            const option = select.options[select.selectedIndex];
            const salaryBase = option ? option.getAttribute('data-salary') : null;
            const salaryInput = document.getElementById('empSalary');
            salaryInput.value = salaryBase ? salaryBase : '';
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('empName').value.trim(),
            department_id: document.getElementById('empDept').value,
            position_id: document.getElementById('empPos').value,
            salary: parseFloat(document.getElementById('empSalary').value),
            hire_date: document.getElementById('empHireDate').value,
            email: document.getElementById('empEmail').value,
            phone: document.getElementById('empPhone').value
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

        const result = await employeeDb.createEmployee(data);
        if (result.success) {
            this.showMessage('Thêm thành công', 'success');
            document.getElementById('addEmployeeForm').reset();
        } else {
            this.showMessage(result.error || 'Lỗi thêm', 'error');
        }
    }

    showMessage(msg, type) {
        const msgEl = document.getElementById('msg');
        msgEl.textContent = msg;
        msgEl.className = `message ${type}`;
        setTimeout(() => msgEl.textContent = '', 3000);
    }
}

export default new AddEmployeeModule();
