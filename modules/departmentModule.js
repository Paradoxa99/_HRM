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
        container.innerHTML = '<h2>Quản Lý Phòng Ban</h2>';
        // Tạo bảng hiển thị phòng ban
        const table = document.createElement('table');
        const header = document.createElement('tr');
        ['ID', 'Tên', 'ID Quản Lý', 'Hành Động'].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            header.appendChild(th);
        });
        table.appendChild(header);

        // Thêm dữ liệu từng phòng ban
        this.getAllDepartments().forEach(dept => {
            const row = document.createElement('tr');
            [dept.id, dept.name, dept.managerId].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                row.appendChild(td);
            });
            const actionsTd = document.createElement('td');
            // Nút chỉnh sửa
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Chỉnh Sửa';
            editBtn.addEventListener('click', () => this.handleEdit(dept.id));
            // Nút xóa
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Xóa';
            deleteBtn.addEventListener('click', () => this.handleDelete(dept.id));
            actionsTd.append(editBtn, deleteBtn);
            row.appendChild(actionsTd);
            table.appendChild(row);
        });
        container.appendChild(table);

        // Form thêm phòng ban mới
        const addForm = document.createElement('form');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Tên Phòng Ban';
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Thêm';
        addBtn.type = 'submit';
        addForm.append(nameInput, addBtn);
        // Gắn event listener cho form
        addForm.addEventListener('submit', (e) => this.handleAdd(e, nameInput.value));
        container.appendChild(addForm);
    },

    // Hàm xử lý thêm phòng ban
    async handleAdd(e, name) {
        e.preventDefault();
        try {
            await this.addDepartment(name);
            // Render lại giao diện
            this.render();
        } catch (err) {
            alert(err.message);
        }
    },

    // Hàm xử lý chỉnh sửa phòng ban
    handleEdit(id) {
        const newName = prompt('Tên mới:');
        if (newName) {
            this.editDepartment(id, newName).then(() => this.render()).catch(alert);
        }
    },

    // Hàm xử lý xóa phòng ban
    handleDelete(id) {
        if (confirm('Xóa phòng ban?')) {
            this.deleteDepartment(id).then(() => this.render()).catch(alert);
        }
    }
};
