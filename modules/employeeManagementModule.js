// Import các module nhân viên
import { AddEmployeeModule } from './addEmployeeModule.js';
import { EditEmployeeModule } from './editEmployeeModule.js';
import { EmployeeDbModule } from './employeeDbModule.js';
import { DepartmentModule } from './departmentModule.js';
import { PositionModule } from './positionModule.js';

export const EmployeeManagementModule = {
    currentView: 'list', // 'list', 'add', 'edit'

    // Hàm render giao diện quản lý nhân viên
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <h2>Quản Lý Nhân Viên</h2>
            <div id="employee-content"></div>
        `;

        // Mặc định hiển thị danh sách
        this.showListView();
    },

    // Hiển thị view danh sách
    showListView() {
        this.currentView = 'list';
        const content = document.getElementById('employee-content');
        const employees = EmployeeDbModule.getAllEmployees().sort((a, b) => {
            if (a.departmentId !== b.departmentId) {
                return a.departmentId.localeCompare(b.departmentId);
            }
            return a.name.localeCompare(b.name);
        });
        const departments = DepartmentModule.getAllDepartments();

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Danh Sách Nhân Viên</h3>
                <button id="add-employee-btn" class="action-btn" style="background-color: #4CAF50; color: white; padding: 10px 20px;">Thêm Nhân Viên</button>
            </div>
            <div style="margin-bottom: 20px;">
                <input type="text" id="search-employee" placeholder="Tìm kiếm theo tên hoặc ID" style="padding: 8px; width: 300px; margin-right: 10px;">
                <button id="search-btn" class="action-btn" style="background-color: #2196F3; color: white; padding: 8px 16px;">Tìm Kiếm</button>
            </div>
            <table class="employee-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Phòng Ban</th>
                        <th>Vị Trí</th>
                        <th>Lương</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(emp => {
                        const dept = departments.find(d => d.id === emp.departmentId);
                        const pos = PositionModule.getAllPositions().find(p => p.id === emp.positionId);
                        return `
                            <tr>
                                <td>${emp.id}</td>
                                <td>${emp.name}</td>
                                <td>${dept ? dept.name : 'N/A'}</td>
                                <td>${pos ? pos.title : 'N/A'}</td>
                                <td>${emp.salary.toLocaleString()}</td>
                                <td>
                                    <button class="action-btn edit-btn" data-id="${emp.id}">Sửa</button>
                                    <button class="action-btn delete-btn" data-id="${emp.id}">Xóa</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        // Gắn event listener
        document.getElementById('add-employee-btn').addEventListener('click', () => this.showAddView());
        document.getElementById('search-btn').addEventListener('click', () => this.handleSearch());
        document.getElementById('search-employee').addEventListener('input', () => this.handleSearch());
        content.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showEditView(e.target.dataset.id));
        });
        content.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDelete(e.target.dataset.id));
        });
    },

    // Hiển thị view thêm nhân viên
    showAddView() {
        this.currentView = 'add';
        const content = document.getElementById('employee-content');

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Thêm Nhân Viên Mới</h3>
                <button id="back-to-list-btn" class="action-btn" style="background-color: #666; color: white; padding: 10px 20px;">Quay Lại</button>
            </div>
            <form id="add-employee-form" style="max-width: 600px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label for="name">Tên nhân viên:</label>
                        <input type="text" id="name" required>
                    </div>
                    <div>
                        <label for="department">Phòng ban:</label>
                        <select id="department" required>
                            <option value="">Chọn phòng ban</option>
                        </select>
                    </div>
                    <div>
                        <label for="position">Vị trí:</label>
                        <select id="position" required>
                            <option value="">Chọn vị trí</option>
                        </select>
                    </div>
                    <div>
                        <label for="salary">Lương:</label>
                        <input type="number" id="salary" required min="0">
                    </div>
                    <div>
                        <label for="hire-date">Ngày thuê:</label>
                        <input type="date" id="hire-date" required>
                    </div>
                    <div>
                        <label for="bonus">Thưởng:</label>
                        <input type="number" id="bonus" value="0" min="0">
                    </div>
                    <div>
                        <label for="deduction">Khấu trừ:</label>
                        <input type="number" id="deduction" value="0" min="0">
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <button type="submit" class="action-btn" style="background-color: #4CAF50; color: white; padding: 12px 24px; margin-right: 10px;">Thêm Nhân Viên</button>
                    <button type="button" id="cancel-add-btn" class="action-btn" style="background-color: #f44336; color: white; padding: 12px 24px;">Hủy</button>
                </div>
            </form>
        `;

        // Thêm options cho selects
        const deptSelect = document.getElementById('department');
        DepartmentModule.getAllDepartments().forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            deptSelect.appendChild(option);
        });

        const posSelect = document.getElementById('position');
        PositionModule.getAllPositions().forEach(pos => {
            const option = document.createElement('option');
            option.value = pos.id;
            option.textContent = pos.title;
            posSelect.appendChild(option);
        });

        // Gắn event listeners
        document.getElementById('back-to-list-btn').addEventListener('click', () => this.showListView());
        document.getElementById('cancel-add-btn').addEventListener('click', () => this.showListView());
        document.getElementById('add-employee-form').addEventListener('submit', (e) => this.handleAdd(e));
    },

    // Hiển thị view sửa nhân viên
    showEditView(employeeId) {
        this.currentView = 'edit';
        const content = document.getElementById('employee-content');
        const employee = EmployeeDbModule.getEmployeeById(employeeId);

        if (!employee) {
            alert('Không tìm thấy nhân viên!');
            this.showListView();
            return;
        }

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Sửa Thông Tin Nhân Viên</h3>
                <button id="back-to-list-btn" class="action-btn" style="background-color: #666; color: white; padding: 10px 20px;">Quay Lại</button>
            </div>
            <form id="edit-employee-form" style="max-width: 600px;">
                <input type="hidden" id="edit-employee-id" value="${employee.id}">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label for="edit-name">Tên nhân viên:</label>
                        <input type="text" id="edit-name" value="${employee.name}" required>
                    </div>
                    <div>
                        <label for="edit-department">Phòng ban:</label>
                        <select id="edit-department" required>
                            <option value="">Chọn phòng ban</option>
                        </select>
                    </div>
                    <div>
                        <label for="edit-position">Vị trí:</label>
                        <select id="edit-position" required>
                            <option value="">Chọn vị trí</option>
                        </select>
                    </div>
                    <div>
                        <label for="edit-salary">Lương:</label>
                        <input type="number" id="edit-salary" value="${employee.salary}" required min="0">
                    </div>
                    <div>
                        <label for="edit-hire-date">Ngày thuê:</label>
                        <input type="date" id="edit-hire-date" value="${employee.hireDate}" required>
                    </div>
                    <div>
                        <label for="edit-bonus">Thưởng:</label>
                        <input type="number" id="edit-bonus" value="${employee.bonus || 0}" min="0">
                    </div>
                    <div>
                        <label for="edit-deduction">Khấu trừ:</label>
                        <input type="number" id="edit-deduction" value="${employee.deduction || 0}" min="0">
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <button type="submit" class="action-btn" style="background-color: #2196F3; color: white; padding: 12px 24px; margin-right: 10px;">Cập Nhật</button>
                    <button type="button" id="cancel-edit-btn" class="action-btn" style="background-color: #f44336; color: white; padding: 12px 24px;">Hủy</button>
                </div>
            </form>
        `;

        // Thêm options cho selects và set selected values
        const deptSelect = document.getElementById('edit-department');
        DepartmentModule.getAllDepartments().forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            if (dept.id === employee.departmentId) option.selected = true;
            deptSelect.appendChild(option);
        });

        const posSelect = document.getElementById('edit-position');
        PositionModule.getAllPositions().forEach(pos => {
            const option = document.createElement('option');
            option.value = pos.id;
            option.textContent = pos.title;
            if (pos.id === employee.positionId) option.selected = true;
            posSelect.appendChild(option);
        });

        // Gắn event listeners
        document.getElementById('back-to-list-btn').addEventListener('click', () => this.showListView());
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.showListView());
        document.getElementById('edit-employee-form').addEventListener('submit', (e) => this.handleEdit(e));
    },

    // Xử lý thêm nhân viên
    async handleAdd(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            departmentId: document.getElementById('department').value,
            positionId: document.getElementById('position').value,
            salary: parseFloat(document.getElementById('salary').value),
            hireDate: document.getElementById('hire-date').value,
            bonus: parseFloat(document.getElementById('bonus').value) || 0,
            deduction: parseFloat(document.getElementById('deduction').value) || 0
        };

        // Validation
        if (!formData.name || !formData.departmentId || !formData.positionId || !formData.salary || !formData.hireDate) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        try {
            await EmployeeDbModule.addEmployee(formData);
            alert('Thêm nhân viên thành công!');
            this.showListView();
        } catch (error) {
            alert('Lỗi khi thêm nhân viên: ' + error.message);
        }
    },

    // Xử lý sửa nhân viên
    async handleEdit(e) {
        e.preventDefault();

        const employeeId = document.getElementById('edit-employee-id').value;
        const formData = {
            name: document.getElementById('edit-name').value.trim(),
            departmentId: document.getElementById('edit-department').value,
            positionId: document.getElementById('edit-position').value,
            salary: parseFloat(document.getElementById('edit-salary').value),
            hireDate: document.getElementById('edit-hire-date').value,
            bonus: parseFloat(document.getElementById('edit-bonus').value) || 0,
            deduction: parseFloat(document.getElementById('edit-deduction').value) || 0
        };

        // Validation
        if (!formData.name || !formData.departmentId || !formData.positionId || !formData.salary || !formData.hireDate) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        try {
            await EmployeeDbModule.updateEmployee(employeeId, formData);
            alert('Cập nhật nhân viên thành công!');
            this.showListView();
        } catch (error) {
            alert('Lỗi khi cập nhật nhân viên: ' + error.message);
        }
    },

    // Xử lý tìm kiếm nhân viên
    handleSearch() {
        const query = document.getElementById('search-employee').value.trim().toLowerCase();
        const tbody = document.querySelector('.employee-table tbody');
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const id = row.cells[0].textContent.toLowerCase();
            const name = row.cells[1].textContent.toLowerCase();
            if (id.includes(query) || name.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    // Xử lý xóa nhân viên
    async handleDelete(employeeId) {
        // Kiểm tra xem nhân viên có phát sinh làm việc không
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        const leaves = JSON.parse(localStorage.getItem('leaves') || '[]');
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');

        const hasAttendance = attendance.some(a => a.employeeId === employeeId);
        const hasLeaves = leaves.some(l => l.employeeId === employeeId);
        const hasReviews = reviews.some(r => r.employeeId === employeeId);

        if (hasAttendance || hasLeaves || hasReviews) {
            alert('Không thể xóa nhân viên đã phát sinh dữ liệu làm việc (chấm công, nghỉ phép, đánh giá)!');
            return;
        }

        if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;

        try {
            await EmployeeDbModule.deleteEmployee(employeeId);
            alert('Xóa nhân viên thành công!');
            this.showListView(); // Refresh danh sách
        } catch (error) {
            alert('Lỗi khi xóa nhân viên: ' + error.message);
        }
    }
};
