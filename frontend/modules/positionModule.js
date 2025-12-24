// positionModule.js - Quản lý vị trí
const API = 'http://localhost/_HRM1/backend/api.php';

class PositionModule {
    async getAllPositions() {
        const response = await fetch(`${API}?resource=positions`);
        return response.json();
    }

    async createPosition(title, description, salaryBase) {
        const response = await fetch(`${API}?resource=positions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, salary_base: salaryBase })
        });
        return response.json();
    }

    async updatePosition(id, data) {
        const response = await fetch(`${API}?resource=positions&id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    async deletePosition(id) {
        const response = await fetch(`${API}?resource=positions&id=${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
}

class PositionUI {
    constructor() {
        this.posModule = new PositionModule();
        this.container = null;
        this.departments = [];
    }

    async render(container) {
        this.container = container;
        await this.loadDepartments();
        await this.loadPositions();
    }

    async loadDepartments() {
        const response = await fetch('http://localhost/_HRM1/backend/api.php?resource=departments');
        this.departments = await response.json();
    }

    async loadPositions() {
        const positions = await this.posModule.getAllPositions();
        const rows = positions.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.title}</td>
                <td>${p.description || ''}</td>
                <td>$${p.salary_base}</td>
                <td>
                    <button onclick="positionUI.handleEdit(${p.id})">Sửa</button>
                    <button onclick="positionUI.handleDelete(${p.id})">Xóa</button>
                </td>
            </tr>
        `).join('');

        const deptOptions = this.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

        this.container.innerHTML = `
            <div class="position-wrapper">
                <h2>Quản lý Vị trí</h2>
                <div class="add-form">
                    <input type="text" id="posTitle" placeholder="Tiêu đề">
                    <input type="text" id="posDesc" placeholder="Mô tả">
                    <input type="number" id="posSalary" placeholder="Lương cơ bản" min="0" step="0.01">
                    <select id="posDept">
                        <option value="">-- Chọn phòng ban --</option>
                        ${deptOptions}
                    </select>
                    <button onclick="positionUI.handleAdd()">Thêm</button>
                </div>
                <table>
                    <thead><tr><th>ID</th><th>Tiêu đề</th><th>Mô tả</th><th>Lương CB</th><th>Hành động</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <div id="msg"></div>
            </div>
        `;
    }

    async handleAdd() {
        const title = document.getElementById('posTitle').value.trim();
        const desc = document.getElementById('posDesc').value;
        const salary = parseFloat(document.getElementById('posSalary').value) || 0;
        const department_id = document.getElementById('posDept').value;

        if (!title) return this.showMessage('Tiêu đề không được rỗng', 'error');
        if (!department_id) return this.showMessage('Phải chọn phòng ban', 'error');

        const result = await this.posModule.createPosition(title, desc, salary, department_id);
        if (result.success) {
            this.showMessage('Thêm thành công', 'success');
            document.getElementById('posTitle').value = '';
            document.getElementById('posDesc').value = '';
            document.getElementById('posSalary').value = '';
            document.getElementById('posDept').value = '';
            await this.loadPositions();
        }
    }

    async handleEdit(id) {
        const positions = await this.posModule.getAllPositions();
        const pos = positions.find(p => p.id === id);
        if (!pos) {
            this.showMessage('Vị trí không tồn tại', 'error');
            return;
        }

        const title = prompt('Nhập tiêu đề:', pos.title);
        if (!title) return;

        const description = prompt('Nhập mô tả:', pos.description || '');
        if (description === null) return;

        const salaryBaseStr = prompt('Nhập lương cơ bản:', pos.salary_base || '0');
        if (salaryBaseStr === null) return;

        const salaryBase = parseFloat(salaryBaseStr);
        if (isNaN(salaryBase) || salaryBase < 0) {
            this.showMessage('Lương cơ bản không hợp lệ', 'error');
            return;
        }

        // Select department
        const deptOptions = this.departments.map(d => `${d.id}: ${d.name}`).join('\n');
        const deptPrompt = `Nhập ID phòng ban:\n${deptOptions}\nMặc định: ${pos.department_id}`;
        let deptInput = prompt(deptPrompt, pos.department_id);
        if (deptInput === null) return;
        const department_id = parseInt(deptInput);
        if (!this.departments.find(d => d.id === department_id)) {
            this.showMessage('Phòng ban không hợp lệ', 'error');
            return;
        }

        const data = {
            title,
            description,
            salary_base: salaryBase,
            department_id
        };

        const result = await this.posModule.updatePosition(id, data);
        if (result.success) {
            this.showMessage('Cập nhật thành công', 'success');
            await this.loadPositions();
        }
    }

    async handleDelete(id) {
        if (!confirm('Xác nhận xóa?')) return;

        const result = await this.posModule.deletePosition(id);
        if (result.success) {
            this.showMessage('Xóa thành công', 'success');
            await this.loadPositions();
        }
    }

    showMessage(msg, type) {
        const msgEl = document.getElementById('msg');
        msgEl.textContent = msg;
        msgEl.className = `message ${type}`;
        setTimeout(() => msgEl.textContent = '', 3000);
    }
}

const positionUI = new PositionUI();
window.positionUI = positionUI;
export default positionUI.posModule;
export { positionUI };
