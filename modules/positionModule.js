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
    async addPosition(title, desc) {
        if (!title.trim()) throw new Error('Title required');
        const positions = this.getAllPositions();
        positions.push({ id: Date.now().toString(), title: title.trim(), description: desc.trim(), salaryBase: 0 });
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
        container.innerHTML = '<h2>Quản Lý Vị Trí Công Việc</h2>';
        // Tạo bảng hiển thị vị trí công việc
        const table = document.createElement('table');
        const header = document.createElement('tr');
        ['ID', 'Tiêu Đề', 'Mô Tả', 'Lương Cơ Bản', 'Hành Động'].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            header.appendChild(th);
        });
        table.appendChild(header);

        // Thêm dữ liệu từng vị trí
        this.getAllPositions().forEach(pos => {
            const row = document.createElement('tr');
            [pos.id, pos.title, pos.description, pos.salaryBase].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                row.appendChild(td);
            });
            const actionsTd = document.createElement('td');
            // Nút chỉnh sửa
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Chỉnh Sửa';
            editBtn.addEventListener('click', () => this.handleEdit(pos.id));
            // Nút xóa
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Xóa';
            deleteBtn.addEventListener('click', () => this.handleDelete(pos.id));
            actionsTd.append(editBtn, deleteBtn);
            row.appendChild(actionsTd);
            table.appendChild(row);
        });
        container.appendChild(table);

        // Form thêm vị trí mới
        const addForm = document.createElement('form');
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.placeholder = 'Tiêu Đề';
        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.placeholder = 'Mô Tả';
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Thêm';
        addBtn.type = 'submit';
        addForm.append(titleInput, descInput, addBtn);
        // Gắn event listener cho form
        addForm.addEventListener('submit', (e) => this.handleAdd(e, titleInput.value, descInput.value));
        container.appendChild(addForm);
    },

    // Hàm xử lý thêm vị trí
    async handleAdd(e, title, desc) {
        e.preventDefault();
        try {
            await this.addPosition(title, desc);
            // Render lại giao diện
            this.render();
        } catch (err) {
            alert(err.message);
        }
    },

    // Hàm xử lý chỉnh sửa vị trí
    handleEdit(id) {
        const newTitle = prompt('Tiêu đề mới:');
        if (newTitle) {
            this.editPosition(id, { title: newTitle }).then(() => this.render()).catch(alert);
        }
    },

    // Hàm xử lý xóa vị trí
    handleDelete(id) {
        if (confirm('Xóa vị trí?')) {
            this.deletePosition(id).then(() => this.render()).catch(alert);
        }
    }
};
