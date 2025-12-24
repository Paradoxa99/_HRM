// searchEmployeeModule.js - Tìm kiếm nâng cao
import employeeDb from './employeeDbModule.js';
import { departmentUI } from './departmentModule.js';

class SearchEmployeeModule {
    constructor() {
        this.container = null;
        this.results = [];
    }

    async render(container) {
        this.container = container;
        const departments = await departmentUI.deptModule.getAllDepartments();

        this.container.innerHTML = `
            <div class="search-wrapper">
                <h2>Tìm kiếm Nhân viên</h2>
                <div class="filter-form">
                    <input type="text" id="filterName" placeholder="Tên nhân viên">
                    <select id="filterDept">
                        <option value="">-- Tất cả phòng ban --</option>
                        ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                    </select>
                    <input type="number" id="filterMinSalary" placeholder="Lương tối thiểu" min="0">
                    <input type="number" id="filterMaxSalary" placeholder="Lương tối đa" min="0">
                    <button id="searchBtn">Tìm kiếm</button>
                    <button id="sortBtn">Sắp xếp theo lương</button>
                </div>
                <table id="resultsTable" style="display:none;">
                    <thead><tr><th>ID</th><th>Tên</th><th>Phòng ban</th><th>Vị trí</th><th>Lương</th><th>Ngày tuyển</th></tr></thead>
                    <tbody id="tableBody"></tbody>
                </table>
                <div id="noResults"></div>
            </div>
        `;

        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('sortBtn').addEventListener('click', () => this.handleSort());
    }

    async handleSearch() {
        const filters = {
            name: document.getElementById('filterName').value,
            department_id: document.getElementById('filterDept').value,
            min_salary: document.getElementById('filterMinSalary').value,
            max_salary: document.getElementById('filterMaxSalary').value
        };

        this.results = await employeeDb.searchEmployees(filters);
        this.displayResults();
    }

    handleSort() {
        this.results.sort((a, b) => a.salary - b.salary);
        this.displayResults();
    }

    displayResults() {
        if (!this.results.length) {
            document.getElementById('resultsTable').style.display = 'none';
            document.getElementById('noResults').textContent = 'Không có kết quả';
            return;
        }

        const rows = this.results.map(emp => `
                    <tr>
                        <td>${emp.id}</td>
                        <td>${emp.name}</td>
                        <td>${emp.department_name || 'N/A'}</td>
                        <td>${emp.position_title || 'N/A'}</td>
                        <td>$${emp.salary}</td>
                        <td>${emp.hire_date}</td>
                    </tr>
        `).join('');

        document.getElementById('tableBody').innerHTML = rows;
        document.getElementById('resultsTable').style.display = 'table';
        document.getElementById('noResults').textContent = '';
    }
}

export default new SearchEmployeeModule();
