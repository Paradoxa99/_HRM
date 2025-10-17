import { Department } from '../models/department.js';
import { StorageService } from '../utils/storage.js';
import { ValidationService } from '../utils/validation.js';

export class DepartmentController {
    constructor() {
        // Khởi tạo các dịch vụ cần thiết
        this.storageService = new StorageService('departments');
        this.validator = new ValidationService();
        this.departments = this.loadDepartments();
        this.employeeStorage = new StorageService('employees');
        // Sử dụng Map để lưu cache số lượng nhân viên
        this.employeeCountCache = new Map();
    }

    loadDepartments() {
        // Tải danh sách phòng ban từ storage
        const departments = this.storageService.getData() || [];
        return departments.map(dept => new Department(dept));
    }

    async addDepartment(name, managerId) {
        try {
            // Kiểm tra tính hợp lệ của tên phòng ban
            this.validator.validateDepartmentName(name);

            // Tạo phòng ban mới với ID là timestamp
            const department = new Department({
                id: Date.now().toString(),
                name,
                managerId
            });

            this.departments.push(department);
            await this.saveDepartments();
            return department;
        } catch (error) {
            throw new Error(`Không thể thêm phòng ban: ${error.message}`);
        }
    }

    async editDepartment(id, updates) {
        try {
            const department = this.getDepartmentById(id);
            if (!department) {
                throw new Error('Department not found');
            }

            if (updates.name) {
                this.validator.validateDepartmentName(updates.name);
                department.name = updates.name;
            }

            if (updates.managerId) {
                department.managerId = updates.managerId;
            }

            await this.saveDepartments();
            return department;
        } catch (error) {
            throw new Error(`Không thể sửa phòng ban: ${error.message}`);
        }
    }

    async deleteDepartment(id) {
        try {
            const index = this.departments.findIndex(dept => dept.id === id);
            if (index === -1) {
                throw new Error('Department not found');
            }

            this.departments.splice(index, 1);
            await this.saveDepartments();
            return true;
        } catch (error) {
            throw new Error(`Không thể xóa phòng ban: ${error.message}`);
        }
    }

    getDepartmentById(id) {
        return this.departments.find(dept => dept.id === id);
    }

    getAllDepartments() {
        return [...this.departments];
    }

    getDepartmentEmployeeCount(departmentId) {
        try {
            // Kiểm tra cache trước
            if (this.employeeCountCache.has(departmentId)) {
                return this.employeeCountCache.get(departmentId);
            }

            // Lấy danh sách tất cả nhân viên
            const employees = this.employeeStorage.getData() || [];

            // Đếm số nhân viên trong phòng ban
            const count = employees.filter(emp => emp.departmentId === departmentId).length;

            // Lưu kết quả vào cache
            this.employeeCountCache.set(departmentId, count);

            return count;
        } catch (error) {
            console.error(`Lỗi khi đếm số nhân viên trong phòng ban ${departmentId}:`, error);
            return 0;
        }
    }

    // Add cache invalidation method
    invalidateEmployeeCountCache(departmentId) {
        // Xóa cache của một phòng ban cụ thể hoặc tất cả các phòng ban
        if (departmentId) {
            this.employeeCountCache.delete(departmentId);
        } else {
            this.employeeCountCache.clear();
        }
    }

    async saveDepartments() {
        try {
            // Giả lập độ trễ mạng
            await new Promise(resolve => setTimeout(resolve, 300));
            this.storageService.saveData(this.departments);
        } catch (error) {
            throw new Error('Không thể lưu thông tin phòng ban');
        }
    }

    async getTotalDepartments() {
        return this.departments.length;
    }

    async getDepartments() {
        return this.departments;
    }

    async updateDepartment(id, data) {
        const index = this.departments.findIndex(dep => dep.id === id);
        if (index !== -1) {
            this.departments[index] = { ...this.departments[index], ...data };
        }
    }

    async deleteDepartment(id) {
        this.departments = this.departments.filter(dep => dep.id !== id);
    }
}

export function initDepartmentModule() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Quản lý phòng ban</h2>
        <div class="department-controls">
            <button id="addDepartment">Thêm phòng ban</button>
            <table id="departmentTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên phòng ban</th>
                        <th>Trưởng phòng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;
}
