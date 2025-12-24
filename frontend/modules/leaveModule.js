// leaveModule.js - Quản lý Nghỉ phép
const API = 'http://localhost/_HRM1/backend/api.php';

class LeaveModule {
    async requestLeave(employeeId, startDate, endDate, type, reason) {
        const response = await fetch(`${API}?resource=leaves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'request', employee_id: employeeId, start_date: startDate, end_date: endDate, type, reason })
        });
        return response.json();
    }

    async approveLeave(leaveId) {
        const response = await fetch(`${API}?resource=leaves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve', leave_id: leaveId })
        });
        return response.json();
    }

    async getLeaveBalance(employeeId) {
        const response = await fetch(`${API}?resource=leaves&action=balance&id=${employeeId}`);
        return response.json();
    }

    async getPendingLeaves() {
        const response = await fetch(`${API}?resource=leaves`);
        return response.json();
    }
}

class LeaveUI {
    constructor() {
        this.leaveModule = new LeaveModule();
        this.container = null;
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="leave-wrapper">
                <h2>Quản lý Nghỉ phép</h2>
                <div class="request-form">
                    <h3>Yêu cầu Nghỉ phép</h3>
                    <input type="number" id="leaveEmpId" placeholder="ID nhân viên">
                    <input type="date" id="leaveStart">
                    <input type="date" id="leaveEnd">
                    <select id="leaveType">
                        <option value="annual">Nghỉ hàng năm</option>
                        <option value="sick">Nghỉ ốm</option>
                        <option value="unpaid">Nghỉ không lương</option>
                    </select>
                    <textarea id="leaveReason" placeholder="Lý do"></textarea>
                    <button onclick="leaveUI.handleRequest()">Yêu cầu</button>
                </div>
                <div class="balance-section">
                    <input type="number" id="balanceEmpId" placeholder="ID nhân viên">
                    <button onclick="leaveUI.showBalance()">Xem Số dư</button>
                    <div id="balanceInfo"></div>
                </div>
                <div class="pending-section">
                    <h3>Yêu cầu đang chờ</h3>
                    <div id="pendingTable"></div>
                </div>
                <div id="msg"></div>
            </div>
        `;
        await this.loadPending();
    }

    async handleRequest() {
        const empId = document.getElementById('leaveEmpId').value;
        const start = document.getElementById('leaveStart').value;
        const end = document.getElementById('leaveEnd').value;
        const type = document.getElementById('leaveType').value;
        const reason = document.getElementById('leaveReason').value;

        if (!empId || !start || !end) return this.showMessage('Nhập đủ thông tin', 'error');

        const result = await this.leaveModule.requestLeave(empId, start, end, type, reason);
        if (result.success) {
            this.showMessage('Yêu cầu thành công', 'success');
            document.getElementById('leaveEmpId').value = '';
            document.getElementById('leaveStart').value = '';
            document.getElementById('leaveEnd').value = '';
        } else {
            this.showMessage(result.error || 'Lỗi', 'error');
        }
    }

    async showBalance() {
        const empId = document.getElementById('balanceEmpId').value;
        if (!empId) return this.showMessage('Nhập ID', 'error');

        const balance = await this.leaveModule.getLeaveBalance(empId);
        document.getElementById('balanceInfo').innerHTML = `
            <p>Tổng: ${balance.total_days} | Đã dùng: ${balance.used_days} | Còn lại: ${balance.remaining_days}</p>
        `;
    }

    async loadPending() {
        const leaves = await this.leaveModule.getPendingLeaves();
        if (!Array.isArray(leaves)) return;

        const rows = leaves.filter(l => l.status === 'pending').map(l => `
            <tr>
                <td>${l.id}</td>
                <td>${l.employee_id}</td>
                <td>${l.start_date} đến ${l.end_date}</td>
                <td>${l.type}</td>
                <td><button onclick="leaveUI.handleApprove(${l.id})">Phê duyệt</button></td>
            </tr>
        `).join('');

        document.getElementById('pendingTable').innerHTML = `
            <table>
                <thead><tr><th>ID</th><th>Nhân viên</th><th>Thời gian</th><th>Loại</th><th>Hành động</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    async handleApprove(leaveId) {
        const result = await this.leaveModule.approveLeave(leaveId);
        if (result.success) {
            this.showMessage('Phê duyệt thành công', 'success');
            await this.loadPending();
        }
    }

    showMessage(msg, type) {
        const msgEl = document.getElementById('msg');
        msgEl.textContent = msg;
        msgEl.className = `message ${type}`;
        setTimeout(() => msgEl.textContent = '', 3000);
    }
}

const leaveUI = new LeaveUI();
export default leaveUI.leaveModule;
export { leaveUI };
