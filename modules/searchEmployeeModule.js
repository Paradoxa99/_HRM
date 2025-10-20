// Import các module cần thiết
import { EmployeeDbModule } from './employeeDbModule.js';
import { DepartmentModule } from './departmentModule.js';

export const SearchEmployeeModule = {
    // Hàm render giao diện tìm kiếm nhân viên
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = '<h2>Tìm Kiếm Nhân Viên</h2>';

        // Tạo các nút lựa chọn hiển thị
        const displayOptions = document.createElement('div');
        displayOptions.innerHTML = `
            <button id="show-all">Hiển Thị Toàn Bộ Nhân Viên</button>
            <select id="dept-select" style="display: none;">
                <option value="">Chọn Phòng Ban</option>
            </select>
            <button id="show-by-dept">Hiển Thị Theo Phòng Ban</button>
        `;
        // Thêm options cho select
        const deptSelect = displayOptions.querySelector('#dept-select');
        DepartmentModule.getAllDepartments().forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            deptSelect.appendChild(opt);
        });
        container.appendChild(displayOptions);

        const form = document.createElement('form');
        form.id = 'search-form';

        // Tạo input cho tên với regex
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'name-regex';
        nameInput.placeholder = 'Tên (regex)';

        // Tạo select cho phòng ban
        const deptSelectForm = document.createElement('select');
        deptSelectForm.id = 'department';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Tất Cả Phòng Ban';
        deptSelectForm.appendChild(defaultOpt);
        // Thêm các option phòng ban
        DepartmentModule.getAllDepartments().forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            deptSelectForm.appendChild(opt);
        });

        // Tạo input cho lương tối thiểu
        const minSalaryInput = document.createElement('input');
        minSalaryInput.type = 'number';
        minSalaryInput.id = 'min-salary';
        minSalaryInput.placeholder = 'Lương Tối Thiểu';

        // Tạo input cho lương tối đa
        const maxSalaryInput = document.createElement('input');
        maxSalaryInput.type = 'number';
        maxSalaryInput.id = 'max-salary';
        maxSalaryInput.placeholder = 'Lương Tối Đa';

        // Tạo nút tìm kiếm
        const searchBtn = document.createElement('button');
        searchBtn.textContent = 'Tìm Kiếm';
        searchBtn.type = 'submit';

        // Thêm các element vào form
        form.append(nameInput, deptSelectForm, minSalaryInput, maxSalaryInput, searchBtn);
        container.appendChild(form);

        // Tạo div cho kết quả
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'results';
        container.appendChild(resultsDiv);

        // Gắn event listener cho form
        form.addEventListener('submit', this.handleSearch.bind(this));

        // Gắn event listener cho nút hiển thị
        document.getElementById('show-all').addEventListener('click', () => this.showAllEmployees());
        document.getElementById('show-by-dept').addEventListener('click', () => {
            const deptSelect = document.getElementById('dept-select');
            deptSelect.style.display = deptSelect.style.display === 'none' ? 'inline' : 'none';
            if (deptSelect.style.display === 'inline') {
                deptSelect.addEventListener('change', () => this.showEmployeesBySelectedDepartment());
            }
        });
    },

    // Hàm xử lý tìm kiếm
    handleSearch(e) {
        e.preventDefault();
        // Lấy giá trị từ form
        const nameRegex = document.getElementById('name-regex').value;
        const dept = document.getElementById('department').value;
        const min = parseFloat(document.getElementById('min-salary').value) || 0;
        const max = parseFloat(document.getElementById('max-salary').value) || Infinity;

        // Validate lương
        if (min > max) {
            alert('Lương tối thiểu không thể lớn hơn lương tối đa');
            return;
        }

        // Tạo regex từ chuỗi nhập
        let regex;
        try {
            regex = nameRegex ? new RegExp(nameRegex, 'i') : null;
        } catch {
            alert('Regex không hợp lệ');
            return;
        }

        // Lọc nhân viên theo điều kiện
        const results = EmployeeDbModule.filterEmployees(emp =>
            (!regex || regex.test(emp.name)) &&
            (!dept || emp.departmentId === dept) &&
            emp.salary >= min && emp.salary <= max
        );

        // Hiển thị kết quả
        this.renderResults(results);
    },

    // Hàm render kết quả tìm kiếm
    renderResults(results) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
        if (results.length === 0) {
            resultsDiv.textContent = 'Không có kết quả';
            return;
        }

        // Tạo bảng kết quả
        const table = document.createElement('table');
        const header = document.createElement('tr');
        ['ID', 'Tên', 'Phòng Ban', 'Lương'].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            // Thêm event sort cho cột Salary
            if (h === 'Lương') {
                th.addEventListener('click', () => this.sortAndRender(results, (a, b) => a.salary - b.salary));
            }
            header.appendChild(th);
        });
        table.appendChild(header);

        // Thêm các hàng dữ liệu
        results.forEach(emp => {
            const row = document.createElement('tr');
            [emp.id, emp.name, emp.departmentId, emp.salary].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                row.appendChild(td);
            });
            table.appendChild(row);
        });
        resultsDiv.appendChild(table);
    },

    // Hàm sort và render lại kết quả
    sortAndRender(results, comparator) {
        const sorted = EmployeeDbModule.sortEmployees(comparator);
        this.renderResults(sorted);
    },

    // Hàm hiển thị toàn bộ nhân viên
    showAllEmployees() {
        const allEmployees = EmployeeDbModule.getAllEmployees();
        // Sắp xếp theo phòng ban (theo ID), rồi theo tên
        const sortedEmployees = allEmployees.sort((a, b) => {
            if (a.departmentId !== b.departmentId) {
                return a.departmentId.localeCompare(b.departmentId);
            }
            return a.name.localeCompare(b.name);
        });
        this.renderResults(sortedEmployees);
    },

    // Hàm hiển thị nhân viên theo phòng ban
    showEmployeesByDepartment() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        const departments = DepartmentModule.getAllDepartments();
        departments.forEach(dept => {
            const deptEmployees = EmployeeDbModule.filterEmployees(emp => emp.departmentId === dept.id);
            if (deptEmployees.length > 0) {
                const deptHeader = document.createElement('h3');
                deptHeader.textContent = `Phòng Ban: ${dept.name}`;
                resultsDiv.appendChild(deptHeader);

                this.renderResults(deptEmployees);
            }
        });
    },

    // Hàm hiển thị nhân viên theo phòng ban được chọn
    showEmployeesBySelectedDepartment() {
        const deptSelect = document.getElementById('dept-select');
        const selectedDeptId = deptSelect.value;
        if (!selectedDeptId) return;

        const dept = DepartmentModule.getAllDepartments().find(d => d.id === selectedDeptId);
        if (!dept) return;

        const deptEmployees = EmployeeDbModule.filterEmployees(emp => emp.departmentId === selectedDeptId);
        // Sắp xếp theo tên
        const sortedEmployees = deptEmployees.sort((a, b) => a.name.localeCompare(b.name));
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        const deptHeader = document.createElement('h3');
        deptHeader.textContent = `Phòng Ban: ${dept.name}`;
        resultsDiv.appendChild(deptHeader);

        this.renderResults(sortedEmployees);
    }
};
