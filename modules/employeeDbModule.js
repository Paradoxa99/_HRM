export const EmployeeDbModule = {
    // Hàm lấy tất cả nhân viên
    getAllEmployees() {
        try {
            const data = localStorage.getItem('employees');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    // Hàm lấy nhân viên theo ID
    getEmployeeById(id) {
        const employees = this.getAllEmployees();
        const emp = employees.find(e => e.id === id);
        if (!emp) throw new Error('Employee not found');
        return emp;
    },

    // Hàm lưu danh sách nhân viên
    async saveEmployees(employees) {
        if (JSON.stringify(employees).length > 5000000) {
            throw new Error('Storage limit exceeded');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
            localStorage.setItem('employees', JSON.stringify(employees));
        } catch (e) {
            throw new Error('Save failed: ' + e.message);
        }
    },

    // Hàm lọc nhân viên theo điều kiện
    filterEmployees(predicate) {
        if (typeof predicate !== 'function') throw new Error('Predicate must be a function');
        return this.getAllEmployees().filter(predicate);
    },

    // Hàm sắp xếp nhân viên
    sortEmployees(comparator) {
        if (typeof comparator !== 'function') throw new Error('Comparator must be a function');
        return [...this.getAllEmployees()].sort(comparator);
    },

    // Hàm thêm nhân viên mới
    async addEmployee(employee) {
        const employees = this.getAllEmployees();
        employees.push(employee);
        await this.saveEmployees(employees);
    },

    // Hàm cập nhật thông tin nhân viên
    async updateEmployee(id, updates) {
        const employees = this.getAllEmployees();
        const index = employees.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Employee not found');
        employees[index] = { ...employees[index], ...updates };
        await this.saveEmployees(employees);
    },

    // Hàm xóa nhân viên
    async deleteEmployee(id) {
        const employees = this.getAllEmployees();
        const filtered = employees.filter(e => e.id !== id);
        await this.saveEmployees(filtered);
    }
};
