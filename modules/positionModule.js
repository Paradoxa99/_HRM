export const PositionModule = {
    // Hàm lấy tất cả vị trí công việc
    getAllPositions() {
        try {
            return JSON.parse(localStorage.getItem('positions') || '[]');
        } catch {
            return [];
        }
    },

    // Hàm thêm vị trí công việc mới
    async addPosition(title, desc, salaryBase) {
        if (!title.trim()) throw new Error('Title required');
        const positions = this.getAllPositions();
        positions.push({ id: Date.now().toString(), title: title.trim(), description: desc.trim(), salaryBase: parseFloat(salaryBase) || 0 });
        await this.savePositions(positions);
    },

    // Hàm chỉnh sửa vị trí công việc
    async editPosition(id, updates) {
        const positions = this.getAllPositions();
        const index = positions.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Position not found');
        positions[index] = { ...positions[index], ...updates };
        await this.savePositions(positions);
    },

    // Hàm xóa vị trí công việc
    async deletePosition(id) {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        if (employees.some(e => e.positionId === id)) {
            throw new Error('Cannot delete: Position has employees');
        }
        const positions = this.getAllPositions().filter(p => p.id !== id);
        await this.savePositions(positions);
    },

    // Hàm lưu danh sách vị trí công việc
    async savePositions(positions) {
        await new Promise(resolve => setTimeout(resolve, 500));
        localStorage.setItem('positions', JSON.stringify(positions));
    },

    // Hàm render giao diện quản lý vị trí công việc
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <h2>Quản Lý Vị Trí Công Việc</h2>
            <div id="position-content"></div>
        `;

        this.showListView();
    },

    // Hiển thị view danh sách
    showListView() {
        const content = document.getElementById('position-content');
        const positions = this.getAllPositions().sort((a, b) => a.title.localeCompare(b.title));

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Danh Sách Vị Trí Công Việc</h3>
                <button id="add-position-btn" class="action-btn" style="background-color: #4CAF50; color: white; padding: 10px 20px;">Thêm Vị Trí</button>
            </div>
            <table class="position-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tiêu Đề</th>
                        <th>Mô Tả</th>
                        <th>Lương Cơ Bản</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    ${positions.map(pos => `
                        <tr>
                            <td>${pos.id}</td>
                            <td>${pos.title}</td>
                            <td>${pos.description || 'Chưa có'}</td>
                            <td>${pos.salaryBase ? pos.salaryBase.toLocaleString() : '0'}</td>
                            <td>
                                <button class="action-btn edit-btn" data-id="${pos.id}">Sửa</button>
                                <button class="action-btn delete-btn" data-id="${pos.id}">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Gắn event listeners
        document.getElementById('add-position-btn').addEventListener('click', () => this.showAddView());
        content.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showEditView(e.target.dataset.id));
        });
        content.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDelete(e.target.dataset.id));
        });
    },

    // Hiển thị view thêm vị trí
    showAddView() {
        const content = document.getElementById('position-content');

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Thêm Vị Trí Công Việc Mới</h3>
                <button id="back-to-list-btn" class="action-btn" style="background-color: #666; color: white; padding: 10px 20px;">Quay Lại</button>
            </div>
            <form id="add-position-form" style="max-width: 500px;">
                <div style="margin-bottom: 15px;">
                    <label for="position-title">Tiêu đề:</label>
                    <input type="text" id="position-title" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="position-description">Mô tả:</label>
                    <textarea id="position-description" rows="3" style="width: 100%; padding: 8px; margin-top: 5px;"></textarea>
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="position-salary">Lương cơ bản:</label>
                    <input type="number" id="position-salary" min="0" style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div style="margin-top: 20px;">
                    <button type="submit" class="action-btn" style="background-color: #4CAF50; color: white; padding: 12px 24px; margin-right: 10px;">Thêm Vị Trí</button>
                    <button type="button" id="cancel-add-btn" class="action-btn" style="background-color: #f44336; color: white; padding: 12px 24px;">Hủy</button>
                </div>
            </form>
        `;

        // Gắn event listeners
        document.getElementById('back-to-list-btn').addEventListener('click', () => this.showListView());
        document.getElementById('cancel-add-btn').addEventListener('click', () => this.showListView());
        document.getElementById('add-position-form').addEventListener('submit', (e) => this.handleAdd(e));
    },

    // Hiển thị view sửa vị trí
    showEditView(positionId) {
        const content = document.getElementById('position-content');
        const position = this.getAllPositions().find(p => p.id === positionId);

        if (!position) {
            alert('Không tìm thấy vị trí!');
            this.showListView();
            return;
        }

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Sửa Thông Tin Vị Trí Công Việc</h3>
                <button id="back-to-list-btn" class="action-btn" style="background-color: #666; color: white; padding: 10px 20px;">Quay Lại</button>
            </div>
            <form id="edit-position-form" style="max-width: 500px;">
                <input type="hidden" id="edit-position-id" value="${position.id}">
                <div style="margin-bottom: 15px;">
                    <label for="edit-position-title">Tiêu đề:</label>
                    <input type="text" id="edit-position-title" value="${position.title}" required style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="edit-position-description">Mô tả:</label>
                    <textarea id="edit-position-description" rows="3" style="width: 100%; padding: 8px; margin-top: 5px;">${position.description || ''}</textarea>
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="edit-position-salary">Lương cơ bản:</label>
                    <input type="number" id="edit-position-salary" value="${position.salaryBase || 0}" min="0" style="width: 100%; padding: 8px; margin-top: 5px;">
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
        document.getElementById('edit-position-form').addEventListener('submit', (e) => this.handleEdit(e));
    },

    // Hàm xử lý thêm vị trí
    async handleAdd(e) {
        e.preventDefault();

        const title = document.getElementById('position-title').value.trim();
        const description = document.getElementById('position-description').value.trim();
        const salaryBase = document.getElementById('position-salary').value;

        // Validation
        if (!title) {
            alert('Vui lòng nhập tiêu đề vị trí!');
            return;
        }

        try {
            await this.addPosition(title, description, salaryBase);
            alert('Thêm vị trí thành công!');
            this.showListView();
        } catch (error) {
            alert('Lỗi khi thêm vị trí: ' + error.message);
        }
    },

    // Hàm xử lý chỉnh sửa vị trí
    async handleEdit(e) {
        e.preventDefault();

        const positionId = document.getElementById('edit-position-id').value;
        const title = document.getElementById('edit-position-title').value.trim();
        const description = document.getElementById('edit-position-description').value.trim();
        const salaryBase = document.getElementById('edit-position-salary').value;

        // Validation
        if (!title) {
            alert('Vui lòng nhập tiêu đề vị trí!');
            return;
        }

        try {
            await this.editPosition(positionId, { title, description, salaryBase: parseFloat(salaryBase) || 0 });
            alert('Cập nhật vị trí thành công!');
            this.showListView();
        } catch (error) {
            alert('Lỗi khi cập nhật vị trí: ' + error.message);
        }
    },

    // Hàm xử lý xóa vị trí
    async handleDelete(positionId) {
        // Kiểm tra xem vị trí có nhân viên không
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        if (employees.some(e => e.positionId === positionId)) {
            alert('Không thể xóa vị trí đã có nhân viên!');
            return;
        }

        if (!confirm('Bạn có chắc chắn muốn xóa vị trí này?')) return;

        try {
            await this.deletePosition(positionId);
            alert('Xóa vị trí thành công!');
            this.showListView(); // Refresh danh sách
        } catch (error) {
            alert('Lỗi khi xóa vị trí: ' + error.message);
        }
    }
};
