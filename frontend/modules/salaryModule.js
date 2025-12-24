// salaryModule.js - Quản lý Lương
const API = 'http://localhost/_HRM1/backend/api.php';

class SalaryModule {
    async getPayrollReport() {
        const response = await fetch(`${API}?resource=salary&action=report`);
        return response.json();
    }

    async calculateNetSalary(employeeId) {
        const response = await fetch(`${API}?resource=salary&id=${employeeId}`);
        return response.json();
    }

    async updateSalaryBonus(employeeId, bonus, deduction) {
        const response = await fetch(`${API}?resource=salary&id=${employeeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id: employeeId, bonus, deduction, action: 'update' })
        });
        return response.json();
    }
}

import employeeDb from './employeeDbModule.js';

class SalaryUI {
    constructor() {
        this.salaryModule = new SalaryModule();
        this.container = null;
        this.employees = [];
    }

    async render(container) {
        this.container = container;
        this.employees = await employeeDb.getAllEmployees();
        const report = await this.salaryModule.getPayrollReport();

        if (report.error) {
            this.container.innerHTML = `<div class="error">${report.error}</div>`;
            return;
        }

        const rows = report.payroll.map(emp => `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>$${emp.salary}</td>
                <td>$${emp.bonus}</td>
                <td>$${emp.deduction}</td>
                <td><strong>$${emp.net_salary}</strong></td>
            </tr>
        `).join('');

        this.container.innerHTML = `
            <div class="salary-wrapper">
                <h2>Báo cáo Lương</h2>
                <div class="summary">
                    <p><strong>Tổng cộng nhân viên:</strong> ${report.employee_count}</p>
                    <p><strong>Tổng lương:</strong> $${report.total_payroll}</p>
                </div>
                <table>
                    <thead><tr><th>ID</th><th>Tên</th><th>Lương</th><th>Thưởng</th><th>Khấu trừ</th><th>Thực lĩnh</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <div class="update-bonus-deduction">
                    <h3>Cập nhật Thưởng & Khấu trừ</h3>
                    <select id="bonusEmpId">
                        <option value="">-- Chọn nhân viên --</option>
                        ${this.employees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('')}
                    </select>
                    <input type="number" id="bonusInput" placeholder="Thưởng" step="0.01" min="0" />
                    <input type="number" id="deductionInput" placeholder="Khấu trừ" step="0.01" min="0" />
                    <button id="updateBonusBtn">Cập nhật</button>
                </div>
                <div id="updateMsg"></div>
            </div>
        `;

        document.getElementById('updateBonusBtn').addEventListener('click', () => this.handleUpdateBonusDeduction());
    }

    async handleUpdateBonusDeduction() {
        const empId = document.getElementById('bonusEmpId').value.trim();
        const bonus = parseFloat(document.getElementById('bonusInput').value);
        const deduction = parseFloat(document.getElementById('deductionInput').value);

        if (!empId || isNaN(bonus) || isNaN(deduction) || bonus < 0 || deduction < 0) {
            this.showUpdateMessage('Vui lòng nhập đúng ID và giá trị thưởng, khấu trừ hợp lệ', 'error');
            return;
        }

        const result = await this.salaryModule.updateSalaryBonus(empId, bonus, deduction);
        if (result.success) {
            this.showUpdateMessage('Cập nhật thành công', 'success');
            document.getElementById('bonusEmpId').value = '';
            document.getElementById('bonusInput').value = '';
            document.getElementById('deductionInput').value = '';
            // Refresh payroll report
            await this.render(this.container);
        } else {
            this.showUpdateMessage(result.error || 'Lỗi cập nhật', 'error');
        }
    }

    showUpdateMessage(msg, type) {
        const msgEl = document.getElementById('updateMsg');
        msgEl.textContent = msg;
        msgEl.className = `message ${type}`;
        setTimeout(() => {
            msgEl.textContent = '';
            msgEl.className = '';
        }, 3000);
    }
}

const salaryUI = new SalaryUI();
export default salaryUI.salaryModule;
export { salaryUI };
