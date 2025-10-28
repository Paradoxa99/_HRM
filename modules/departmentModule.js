export const DepartmentModule = {
    // Hàm lấy tất cả phòng ban
    getAllDepartments() {
        try {
            return JSON.parse(localStorage.getItem('departments') || '[]');
        } catch {
            return [];
        }
    },

    // Hàm tạo mã phòng ban
    generateDepartmentCode(name) {
        const words = name.split(' ');
        let code = '';
        for (let i = 0; i < Math.min(2, words.length); i++) {
            code += words[i].charAt(0).toUpperCase();
        }
        // Nếu trùng với ID đã có, thêm ký tự từ chữ tiếp theo
        let existingCodes = this.getAllDepartments().map(d => d.id);
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
    },

    // Hàm tạo ID phòng ban
    generateDepartmentId(name) {
        const code = this.generateDepartmentCode(name);
        let id;
        do {
            const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
            id = code + randomDigits.toString();
        } while (this.getAllDepartments().some(d => d.id === id));
        return id;
    },

    // Hàm thêm phòng ban mới
    async addDepartment(name) {
        if (!name.trim() || this.getAllDepartments().some(d => d.name === name)) {
            throw new Error('Name invalid or duplicate');
        }
        const depts = this.getAllDepartments();
        const id = this.generateDepartmentId(name);
        depts.push({ id, name: name.trim(), managerId: '' });
        await this.saveDepartments(depts);
    },

    // Hàm chỉnh sửa tên phòng ban
    async editDepartment(id, newName) {
        const depts = this.getAllDepartments();
        const index = depts.findIndex(d => d.id === id);
        if (index === -1 || !newName.trim()) throw new Error('Invalid id or name');
        depts[index].name = newName.trim();
        await this.saveDepartments(depts);
    },

    // Hàm xóa phòng ban
    async deleteDepartment(id) {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        if (employees.some(e => e.departmentId === id)) {
            throw new Error('Cannot delete: Department has employees');
        }
        const depts = this.getAllDepartments().filter(d => d.id !== id);
        await this.saveDepartments(depts);
    },

    // Hàm lưu danh sách phòng ban
    async saveDepartments(depts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        localStorage.setItem('departments', JSON.stringify(depts));
    },

    // Hàm render giao diện quản lý phòng ban
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <h2>Quản Lý Phòng Ban</h2>
            <div id="department-content"></div>
        `;

        this.showListView();
    },

    // Hiển thị view danh sách
    showListView() {
        const content = document.getElementById('department-content');
        const departments = this.getAllDepartments().sort((a, b) => a.name.localeCompare(b.name));

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Danh Sách Phòng Ban</h3>
                <button id="add-department-btn" class="action-btn" style="background-color: #4CAF50; color: white; padding: 10px 20px;">Thêm Phòng Ban</button>
            </div>
            <table class="department-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Phòng Ban</th>
                        <th>ID Quản Lý</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    ${departments.map(dept => `
                        <tr>
                            <td>${dept.id}</td>
                            <td>${dept.name}</td>
                            <td>${dept.managerId || 'Chưa có'}</td>
                            <td>
                                <button class="action-btn edit-btn" data-id="${dept.id}">Sửa</button>
                                <button class="action-btn delete-btn" data-id="${dept.id}">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Gắn event listeners
        document.getElementById('add-department-btn').addEventListener('click', () => this.showAddView());
        content.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showEditView(e.target.dataset.id));
        });
        content.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDelete(e.target.dataset.id));
        });
    },

    // Hiển thị view thêm phòng ban
    showAddView() {
        const content = document.getElementById('department-content');

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Thêm Phòng Ban Mới</h3>
                <button id="back-to-list-btn" class="action-btn" style="background-color: #666; color: white; padding: 10px 20px;">Quay Lại</button>
            </div>
            <form id="add-department-form" style="max-width: 400px;">
                <div style="margin-bottom: 15px;">
                    <label for="department-name">Tên phòng ban:</label>
                    <input type="text" id="department-name" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div style="margin-top: 20px;">
                    <button type="submit" class="action-btn" style="background-color: #4CAF50; color: white; padding: 12px 24px; margin-right: 10px;">Thêm Phòng Ban</button>
                    <button type="button" id="cancel-add-btn" class="action-btn" style="background-color: #f44336; color: white; padding: 12px 24px;">Hủy</button>
                </div>
            </form>
        `;

        // Gắn event listeners
        document.getElementById('back-to-list-btn').addEventListener('click', () => this.showListView());
        document.getElementById('cancel-add-btn').addEventListener('click', () => this.showListView());
        document.getElementById('add-department-form').addEventListener('submit', (e) => this.handleAdd(e));
    },

    // Hiển thị view sửa phòng ban
    showEditView(departmentId) {
        const content = document.getElementById('department-content');
        const department = this.getAllDepartments().find(d => d.id === departmentId);

        if (!department) {
            alert('Không tìm thấy phòng ban!');
            this.showListView();
            return;
        }

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Sửa Thông Tin Phòng Ban</h3>
                <button id="back-to-list-btn" class="action-btn" style="background-color: #666; color: white; padding: 10px 20px;">Quay Lại</button>
            </div>
            <form id="edit-department-form" style="max-width: 400px;">
                <input type="hidden" id="edit-department-id" value="${department.id}">
                <div style="margin-bottom: 15px;">
                    <label for="edit-department-name">Tên phòng ban:</label>
                    <input type="text" id="edit-department-name" value="${department.name}" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div style="margin-top: 20px;">
                    <button type="submit" class="action-btn" style="background-color: #2196F3; color: white; padding: 12px 24px; margin-right: 10px;">Cập Nhật</button>
                    <button type="button" id="cancel-edit-btn" class="action-btn" style="background-color: #f44336; color: white; padding: 12px 24px;">Hủy</button>
                </div>
            </form>
        `;

        // Gắn event listeners
        document.getElementById('back-to-list-btn').addEventListener('click', () => this.showListView());
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.showListView());
        document.getElementById('edit-department-form').addEventListener('submit', (e) => this.handleEdit(e));
    },

    // Hàm xử lý thêm phòng ban
    async handleAdd(e) {
        e.preventDefault();

        const name = document.getElementById('department-name').value.trim();

        // Validation
        if (!name) {
            alert('Vui lòng nhập tên phòng ban!');
            return;
        }

        try {
            await this.addDepartment(name);
            alert('Thêm phòng ban thành công!');
            this.showListView();
        } catch (error) {
            alert('Lỗi khi thêm phòng ban: ' + error.message);
        }
    },

    // Hàm xử lý chỉnh sửa phòng ban
    async handleEdit(e) {
        e.preventDefault();

        const departmentId = document.getElementById('edit-department-id').value;
        const newName = document.getElementById('edit-department-name').value.trim();

        // Validation
        if (!newName) {
            alert('Vui lòng nhập tên phòng ban!');
            return;
        }

        try {
            await this.editDepartment(departmentId, newName);
            alert('Cập nhật phòng ban thành công!');
            this.showListView();
        } catch (error) {
            alert('Lỗi khi cập nhật phòng ban: ' + error.message);
        }
    },

    // Hàm xử lý xóa phòng ban
    async handleDelete(departmentId) {
        // Kiểm tra xem phòng ban có nhân viên không
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        if (employees.some(e => e.departmentId === departmentId)) {
            alert('Không thể xóa phòng ban đã có nhân viên!');
            return;
        }

        if (!confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) return;

        try {
            await this.deleteDepartment(departmentId);
            alert('Xóa phòng ban thành công!');
            this.showListView(); // Refresh danh sách
        } catch (error) {
            alert('Lỗi khi xóa phòng ban: ' + error.message);
        }
    }
};
