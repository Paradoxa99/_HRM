// departmentModule.js - Quản lý Phòng ban
const API = 'http://localhost/_HRM1/backend/api.php';

class DepartmentModule {
    async getAllDepartments() {
        const response = await fetch(`${API}?resource=departments`);
        return response.json();
    }

    async createDepartment(name) {
        const response = await fetch(`${API}?resource=departments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        return response.json();
    }

    async updateDepartment(id, name) {
        const response = await fetch(`${API}?resource=departments&id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        return response.json();
    }

    async deleteDepartment(id) {
        const response = await fetch(`${API}?resource=departments&id=${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
}

class DepartmentUI {
    constructor() {
        this.deptModule = new DepartmentModule();
        this.container = null;
        this.openDetailsId = null;
    }

    async render(container) {
        this.container = container;
        await this.loadDepartments();
    }

    async loadDepartments() {
        const depts = await this.deptModule.getAllDepartments();
        const rows = depts.map(d => `
            <tr class="dept-row" data-id="${d.id}">
                <td>${d.id}</td>
                <td>${d.name}</td>
                <td>
                    <button onclick="departmentUI.toggleDetails(${d.id})">Chi tiết</button>
                    <button onclick="departmentUI.handleEdit(${d.id})">Sửa</button>
                    <button onclick="departmentUI.handleDelete(${d.id})">Xóa</button>
                </td>
            </tr>
            <tr class="dept-details-row" id="details-${d.id}" style="display:none;">
                <td colspan="3">Đang tải...</td>
            </tr>
        `).join('');

        this.container.innerHTML = `
            <div class="department-wrapper">
                <h2>Quản lý Phòng ban</h2>
                <div class="add-form">
                    <input type="text" id="deptName" placeholder="Tên phòng ban">
                    <button onclick="departmentUI.handleAdd()">Thêm</button>
                </div>
                <table>
                    <thead><tr><th>ID</th><th>Tên</th><th>Hành động</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <div id="msg"></div>
            </div>
        `;
    }

    async handleAdd() {
        const name = document.getElementById('deptName').value.trim();
        if (!name) return this.showMessage('Tên không được rỗng', 'error');

        const result = await this.deptModule.createDepartment(name);
        if (result.success) {
            this.showMessage('Thêm thành công', 'success');
            document.getElementById('deptName').value = '';
            await this.loadDepartments();
        } else {
            this.showMessage(result.error || 'Lỗi', 'error');
        }
    }

    async toggleDetails(deptId) {
        if (this.openDetailsId === deptId) {
            // Close currently open
            const row = document.getElementById(`details-${deptId}`);
            if (row) row.style.display = 'none';
            this.openDetailsId = null;
            return;
        }

        // Close previously open
        if (this.openDetailsId) {
            const prevRow = document.getElementById(`details-${this.openDetailsId}`);
            if (prevRow) prevRow.style.display = 'none';
        }

        const row = document.getElementById(`details-${deptId}`);
        if (row) {
            row.style.display = '';
            row.innerHTML = '<td colspan="3">Đang tải...</td>';
            // Fetch positions for department
            const posResponse = await fetch(`${API}?resource=positions&department_id=${deptId}`);
            const positions = await posResponse.json();

            if (positions.length) {
                const posList = positions.map(p => `<li>${p.title} (Lương cơ bản: $${p.salary_base})</li>`).join('');
                row.innerHTML = `<td colspan="3"><strong>Vị trí trong phòng ban:</strong><ul>${posList}</ul></td>`;
            } else {
                row.innerHTML = `<td colspan="3"><em>Không có vị trí nào trong phòng ban này.</em></td>`;
            }

            this.openDetailsId = deptId;
        }
    }

    async handleEdit(id) {
        const name = prompt('Nhập tên mới:');
        if (!name) return;

        const result = await this.deptModule.updateDepartment(id, name);
        if (result.success) {
            this.showMessage('Cập nhật thành công', 'success');
            await this.loadDepartments();
        } else {
            this.showMessage(result.error || 'Lỗi', 'error');
        }
    }

    async handleDelete(id) {
        if (!confirm('Xác nhận xóa?')) return;

        const result = await this.deptModule.deleteDepartment(id);
        if (result.success) {
            this.showMessage('Xóa thành công', 'success');
            await this.loadDepartments();
        } else {
            this.showMessage(result.error || 'Lỗi', 'error');
        }
    }

    showMessage(msg, type) {
        const msgEl = document.getElementById('msg');
        msgEl.textContent = msg;
        msgEl.className = `message ${type}`;
        setTimeout(() => msgEl.textContent = '', 3000);
    }
}

const departmentUI = new DepartmentUI();
window.departmentUI = departmentUI;
export default departmentUI.deptModule;
export { departmentUI };
