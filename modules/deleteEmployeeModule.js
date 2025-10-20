import { EmployeeDbModule } from './employeeDbModule.js';
import { DepartmentModule } from './departmentModule.js';

export const DeleteEmployeeModule = {
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = '<h2>Xóa Nhân Viên</h2>';
        const searchForm = document.createElement('form');
        searchForm.id = 'search-form';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'search-id';
        searchInput.placeholder = 'Nhập ID hoặc Tên Nhân Viên';
        const searchBtn = document.createElement('button');
        searchBtn.textContent = 'Tìm Kiếm';
        searchBtn.type = 'submit';
        searchForm.append(searchInput, searchBtn);
        container.appendChild(searchForm);

        const deleteDiv = document.createElement('div');
        deleteDiv.id = 'delete-info';
        container.appendChild(deleteDiv);

        searchForm.addEventListener('submit', this.handleSearch.bind(this));
    },

    handleSearch(e) {
        e.preventDefault();
        const query = document.getElementById('search-id').value.trim();
        let employee;
        try {
            employee = isNaN(query) ? EmployeeDbModule.filterEmployees(e => e.name.toLowerCase().includes(query.toLowerCase()))[0] : EmployeeDbModule.getEmployeeById(query);
        } catch {
            alert('Không tìm thấy nhân viên');
            return;
        }
        if (!employee) {
            alert('Không tìm thấy nhân viên');
            return;
        }
        const depts = DepartmentModule.getAllDepartments();
        const isManager = depts.some(d => d.managerId === employee.id);
        if (isManager) {
            alert('Không thể xóa: Nhân viên là quản lý phòng ban');
            return;
        }
        this.renderDeleteInfo(employee);
    },

    renderDeleteInfo(employee) {
        const info = document.getElementById('delete-info');
        info.innerHTML = `<p>Tên: ${employee.name}, Phòng Ban: ${employee.departmentId}</p>`;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Xóa';
        deleteBtn.addEventListener('click', () => this.handleDelete(employee.id));
        info.appendChild(deleteBtn);
    },

    async handleDelete(id) {
        if (!confirm('Xác nhận xóa nhân viên này?')) return;
        try {
            await EmployeeDbModule.deleteEmployee(id);
            alert('Xóa thành công');
            window.dispatchEvent(new Event('refresh'));
        } catch (err) {
            alert('Xóa thất bại: ' + err.message);
        }
    }
};
