export const LeaveModule = {
    // Hàm lấy danh sách nghỉ phép
    getLeaves() {
        try {
            return JSON.parse(localStorage.getItem('leaves') || '[]');
        } catch {
            return [];
        }
    },

    // Hàm yêu cầu nghỉ phép
    async requestLeave(employeeId, startDate, endDate, type) {
        if (new Date(startDate) > new Date(endDate)) throw new Error('Start date must be before end date');
        const leaves = this.getLeaves();
        // Kiểm tra trùng lặp với nghỉ phép đã duyệt
        const overlap = leaves.some(l => l.employeeId === employeeId && l.status === 'approved' && !(new Date(l.endDate) < new Date(startDate) || new Date(l.startDate) > new Date(endDate)));
        if (overlap) throw new Error('Leave dates overlap with existing approved leave');
        // Thêm yêu cầu nghỉ phép mới
        leaves.push({ id: Date.now().toString(), employeeId, startDate, endDate, type, status: 'pending' });
        await this.saveLeaves(leaves);
    },

    // Hàm duyệt nghỉ phép
    async approveLeave(leaveId) {
        const leaves = this.getLeaves();
        const leave = leaves.find(l => l.id === leaveId);
        if (!leave) throw new Error('Leave not found');
        leave.status = 'approved';
        await this.saveLeaves(leaves);
    },

    // Hàm tính số ngày nghỉ còn lại
    getLeaveBalance(employeeId) {
        const leaves = this.getLeaves().filter(l => l.employeeId === employeeId && l.status === 'approved');
        const daysUsed = leaves.reduce((sum, l) => sum + Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)), 0);
        return 20 - daysUsed; // Giả sử có 20 ngày nghỉ hàng năm
    },

    // Hàm lưu danh sách nghỉ phép
    async saveLeaves(leaves) {
        await new Promise(resolve => setTimeout(resolve, 100));
        localStorage.setItem('leaves', JSON.stringify(leaves));
    },

    // Hàm render giao diện quản lý nghỉ phép
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = '<h2>Quản Lý Nghỉ Phép</h2>';

        // Tạo form yêu cầu nghỉ phép
        const requestForm = document.createElement('form');
        requestForm.id = 'request-leave-form';
        const empIdInput = document.createElement('input');
        empIdInput.type = 'text';
        empIdInput.placeholder = 'ID Nhân Viên';
        const startInput = document.createElement('input');
        startInput.type = 'date';
        const endInput = document.createElement('input');
        endInput.type = 'date';
        const typeSelect = document.createElement('select');
        // Thêm các loại nghỉ phép
        ['Nghỉ Năm', 'Nghỉ Ốm'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            typeSelect.appendChild(opt);
        });
        const requestBtn = document.createElement('button');
        requestBtn.textContent = 'Yêu Cầu Nghỉ Phép';
        requestBtn.type = 'submit';
        requestForm.append(empIdInput, startInput, endInput, typeSelect, requestBtn);
        // Gắn event listener cho form
        requestForm.addEventListener('submit', (e) => this.handleRequest(e, empIdInput.value, startInput.value, endInput.value, typeSelect.value));
        container.appendChild(requestForm);

        // Lấy danh sách nghỉ phép và tạo bảng
        const leaves = this.getLeaves();
        const table = document.createElement('table');
        const header = document.createElement('tr');
        ['ID Nhân Viên', 'Ngày Bắt Đầu', 'Ngày Kết Thúc', 'Loại', 'Trạng Thái', 'Hành Động'].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            header.appendChild(th);
        });
        table.appendChild(header);
        // Thêm dữ liệu từng yêu cầu nghỉ phép
        leaves.forEach(leave => {
            const row = document.createElement('tr');
            [leave.employeeId, leave.startDate, leave.endDate, leave.type, leave.status].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                row.appendChild(td);
            });
            const actionsTd = document.createElement('td');
            // Hiển thị nút duyệt/từ chối cho yêu cầu pending
            if (leave.status === 'pending') {
                const approveBtn = document.createElement('button');
                approveBtn.textContent = 'Duyệt';
                approveBtn.addEventListener('click', () => this.handleApprove(leave.id));
                const rejectBtn = document.createElement('button');
                rejectBtn.textContent = 'Từ Chối';
                rejectBtn.addEventListener('click', () => this.handleReject(leave.id));
                actionsTd.append(approveBtn, rejectBtn);
            }
            row.appendChild(actionsTd);
            table.appendChild(row);
        });
        container.appendChild(table);
    },

    // Hàm xử lý yêu cầu nghỉ phép
    async handleRequest(e, empId, start, end, type) {
        e.preventDefault();
        try {
            await this.requestLeave(empId, start, end, type);
            alert('Đã yêu cầu nghỉ phép');
            // Render lại giao diện
            this.render();
        } catch (err) {
            alert('Yêu cầu thất bại: ' + err.message);
        }
    },

    // Hàm xử lý duyệt nghỉ phép
    async handleApprove(leaveId) {
        try {
            await this.approveLeave(leaveId);
            alert('Đã duyệt nghỉ phép');
            // Render lại giao diện
            this.render();
        } catch (err) {
            alert('Duyệt thất bại: ' + err.message);
        }
    },

    // Hàm xử lý từ chối nghỉ phép
    async handleReject(leaveId) {
        const leaves = this.getLeaves();
        const leave = leaves.find(l => l.id === leaveId);
        if (leave) {
            leave.status = 'rejected';
            await this.saveLeaves(leaves);
            alert('Đã từ chối nghỉ phép');
            // Render lại giao diện
            this.render();
        }
    }
};
