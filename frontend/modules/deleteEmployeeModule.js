// deleteEmployeeModule.js - Xóa nhân viên
import employeeDb from './employeeDbModule.js';

class DeleteEmployeeModule {
    constructor() {
        this.container = null;
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="form-wrapper">
                <h2>Xóa Nhân viên</h2>
                <div class="search-section">
                    <input type="text" id="searchDel" placeholder="Nhập ID hoặc tên">
                    <button id="searchDelBtn">Tìm kiếm</button>
                </div>
                <div id="empInfo"></div>
                <div id="msg"></div>
            </div>
        `;

        document.getElementById('searchDelBtn').addEventListener('click', () => this.handleSearch());
    }

    async handleSearch() {
        const search = document.getElementById('searchDel').value.trim();
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

        document.getElementById('empInfo').innerHTML = `
            <div class="employee-info">
                <p><strong>ID:</strong> ${emp.id}</p>
                <p><strong>Tên:</strong> ${emp.name}</p>
                <p><strong>Lương:</strong> $${emp.salary}</p>
                <button id="deleteBtn" onclick="this.dataset.id='${emp.id}'">Xóa</button>
            </div>
        `;

        document.getElementById('deleteBtn').addEventListener('click', () => this.handleDelete(emp.id));
    }

    async handleDelete(id) {
        if (!confirm('Xác nhận xóa nhân viên này?')) return;

        const result = await employeeDb.deleteEmployee(id);
        if (result.success) {
            this.showMessage('Xóa thành công', 'success');
            document.getElementById('empInfo').innerHTML = '';
            document.getElementById('searchDel').value = '';
        } else {
            this.showMessage(result.error || 'Lỗi xóa', 'error');
        }
    }

    showMessage(msg, type) {
        const msgEl = document.getElementById('msg');
        msgEl.textContent = msg;
        msgEl.className = `message ${type}`;
        setTimeout(() => msgEl.textContent = '', 3000);
    }
}

export default new DeleteEmployeeModule();
