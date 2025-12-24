import employeeDb from './employeeDbModule.js';

// attendanceModule.js - Chấm công
const API = 'http://localhost/_HRM1/backend/api.php';

class AttendanceModule {
    async checkIn(employeeId) {
        const response = await fetch(`${API}?resource=attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'checkin', employee_id: employeeId })
        });
        return response.json();
    }

    async checkOut(employeeId) {
        const response = await fetch(`${API}?resource=attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'checkout', employee_id: employeeId })
        });
        return response.json();
    }

    async getReport(employeeId, from, to) {
        const response = await fetch(`${API}?resource=attendance&action=report&id=${employeeId}&from=${from}&to=${to}`);
        return response.json();
    }
}

class AttendanceUI {
    constructor() {
        this.attModule = new AttendanceModule();
        this.container = null;
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="attendance-wrapper">
                <h2>Chấm Công</h2>
                <div class="checkin-section">
                    <input type="number" id="empIdCheck" placeholder="ID nhân viên">
                    <button onclick="attendanceUI.handleCheckIn()">Check In</button>
                    <button onclick="attendanceUI.handleCheckOut()">Check Out</button>
                </div>
                <div class="report-section">
                    <input type="number" id="reportEmpId" placeholder="ID nhân viên">
                    <input type="date" id="reportFrom">
                    <input type="date" id="reportTo">
                    <button onclick="attendanceUI.handleReport()">Xem báo cáo</button>
                </div>
                <div id="reportTable"></div>
                <div id="msg"></div>
            </div>
        `;
    }

    async handleCheckIn() {
        const empId = document.getElementById('empIdCheck').value.trim();
        if (!empId) return this.showMessage('Nhập ID', 'error');

        const result = await this.attModule.checkIn(empId);
        this.showMessage(result.success ? 'Check in thành công' : result.error, result.success ? 'success' : 'error');
    }

    async handleCheckOut() {
        const empId = document.getElementById('empIdCheck').value.trim();
        if (!empId) return this.showMessage('Nhập ID', 'error');

        const result = await this.attModule.checkOut(empId);
        this.showMessage(result.success ? 'Check out thành công' : result.error, result.success ? 'success' : 'error');
    }

    async handleReport() {
        const empId = document.getElementById('reportEmpId').value;
        const from = document.getElementById('reportFrom').value;
        const to = document.getElementById('reportTo').value;

        if (!empId || !from || !to) return this.showMessage('Nhập đủ thông tin', 'error');

        const report = await this.attModule.getReport(empId, from, to);
        const rows = (report.records || []).map(r => `
            <tr>
                <td>${r.attendance_date}</td>
                <td>${r.check_in || '-'}</td>
                <td>${r.check_out || '-'}</td>
                <td>${r.work_hours || 0} giờ</td>
            </tr>
        `).join('');

        document.getElementById('reportTable').innerHTML = `
            <table>
                <thead><tr><th>Ngày</th><th>Check In</th><th>Check Out</th><th>Giờ làm</th></tr></thead>
                <tbody>${rows}</tbody>
                <tfoot><tr><td colspan="3">Tổng</td><td>${report.total_hours} giờ</td></tr></tfoot>
            </table>
        `;
    }

    showMessage(msg, type) {
        const msgEl = document.getElementById('msg');
        msgEl.textContent = msg;
        msgEl.className = `message ${type}`;
        setTimeout(() => msgEl.textContent = '', 3000);
    }
}

const attendanceUI = new AttendanceUI();
export default attendanceUI.attModule;
export { attendanceUI };
