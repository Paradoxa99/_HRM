// Import các module cần thiết
import { EmployeeDbModule } from './employeeDbModule.js';
import { DepartmentModule } from './departmentModule.js';
import { PositionModule } from './positionModule.js';

export const SearchEmployeeModule = {
    // Hàm render giao diện tìm kiếm nhân viên
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = '<h2>Tìm Kiếm</h2>';

        // Tạo form tìm kiếm
        const form = document.createElement('form');
        form.id = 'search-form';
        form.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                <input type="text" id="name-regex" placeholder="Tên nhân viên (regex)" style="flex: 1; min-width: 200px;">
                <select id="department" style="flex: 1; min-width: 150px;">
                    <option value="">Tất Cả Phòng Ban</option>
                </select>
                <select id="position" style="flex: 1; min-width: 150px;">
                    <option value="">Tất Cả Vị Trí</option>
                </select>
                <input type="number" id="min-salary" placeholder="Lương tối thiểu" style="flex: 1; min-width: 120px;">
                <input type="number" id="max-salary" placeholder="Lương tối đa" style="flex: 1; min-width: 120px;">
                <button type="submit" style="padding: 8px 16px;">Tìm Kiếm</button>
            </div>
        `;

        // Thêm options cho department select
        const deptSelect = form.querySelector('#department');
        DepartmentModule.getAllDepartments().forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            deptSelect.appendChild(opt);
        });

        // Thêm options cho position select
        const posSelect = form.querySelector('#position');
        PositionModule.getAllPositions().forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.title;
            posSelect.appendChild(opt);
        });

        container.appendChild(form);

        // Tạo div cho kết quả
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'results';
        container.appendChild(resultsDiv);

        // Gắn event listener cho form
        form.addEventListener('submit', this.handleSearch.bind(this));

        // Hiển thị tất cả nhân viên mặc định
        this.showAllEmployees();
    },

    // Hàm xử lý tìm kiếm
    handleSearch(e) {
        e.preventDefault();
        // Lấy giá trị từ form
        const nameRegex = document.getElementById('name-regex').value;
        const dept = document.getElementById('department').value;
        const position = document.getElementById('position').value;
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
            (!position || emp.positionId === position) &&
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
            resultsDiv.innerHTML = '<p style="text-align: center; color: #666;">Không có kết quả tìm thấy</p>';
            return;
        }

        // Tạo bảng kết quả
        const table = document.createElement('table');
        table.className = 'search-results-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Phòng Ban</th>
                    <th>Vị Trí</th>
                    <th>Lương</th>
                    <th>Ngày Thuê</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(emp => {
                    const dept = DepartmentModule.getAllDepartments().find(d => d.id === emp.departmentId);
                    const pos = PositionModule.getAllPositions().find(p => p.id === emp.positionId);
                    return `
                        <tr>
                            <td>${emp.id}</td>
                            <td>${emp.name}</td>
                            <td>${dept ? dept.name : 'N/A'}</td>
                            <td>${pos ? pos.title : 'N/A'}</td>
                            <td>${emp.salary.toLocaleString()}</td>
                            <td>${emp.hireDate}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;

        resultsDiv.appendChild(table);
    },

    // Hàm hiển thị toàn bộ nhân viên
    showAllEmployees() {
        const allEmployees = EmployeeDbModule.getAllEmployees();
        // Sắp xếp theo tên
        const sortedEmployees = allEmployees.sort((a, b) => a.name.localeCompare(b.name));
        this.renderResults(sortedEmployees);
    }
};
