export const AttendanceModule = {
    // Hàm lấy danh sách chấm công
    getAttendance() {
        try {
            return JSON.parse(localStorage.getItem('attendance') || '[]');
        } catch {
            return [];
        }
    },

    // Hàm check-in
    async checkIn(employeeId) {
        const logs = this.getAttendance();
        const today = new Date().toISOString().split('T')[0];
        // Kiểm tra đã check-in hôm nay chưa
        if (logs.some(log => log.date === today && log.employeeId === employeeId)) {
            throw new Error('Already checked in today');
        }
        // Thêm bản ghi check-in
        logs.push({ date: today, employeeId, checkIn: Date.now(), checkOut: null });
        await this.saveAttendance(logs);
    },

    // Hàm check-out
    async checkOut(employeeId) {
        const logs = this.getAttendance();
        const today = new Date().toISOString().split('T')[0];
        const log = logs.find(l => l.date === today && l.employeeId === employeeId);
        if (!log || log.checkOut) throw new Error('No check-in or already checked out');
        // Cập nhật thời gian check-out
        log.checkOut = Date.now();
        await this.saveAttendance(logs);
    },

    // Hàm tạo báo cáo chấm công
    getAttendanceReport(employeeId, from, to) {
        if (new Date(from) > new Date(to)) throw new Error('Invalid date range');
        // Lọc bản ghi theo nhân viên và khoảng thời gian
        const logs = this.getAttendance().filter(l =>
            l.employeeId === employeeId &&
            l.date >= from && l.date <= to &&
            l.checkIn && l.checkOut
        );
        // Tính tổng số giờ làm việc
        const totalHours = logs.reduce((sum, l) => sum + (l.checkOut - l.checkIn) / 3600000, 0);
        return { logs, totalHours };
    },

    // Hàm lưu danh sách chấm công
    async saveAttendance(logs) {
        await new Promise(resolve => setTimeout(resolve, 100));
        localStorage.setItem('attendance', JSON.stringify(logs));
    },

    // Hàm render giao diện chấm công
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = '<h2>Chấm Công</h2>';

        // Form check-in
        const checkInForm = document.createElement('form');
        const empIdInput = document.createElement('input');
        empIdInput.type = 'text';
        empIdInput.placeholder = 'ID Nhân Viên';
        const checkInBtn = document.createElement('button');
        checkInBtn.textContent = 'Check In';
        checkInBtn.type = 'submit';
        checkInForm.append(empIdInput, checkInBtn);
        // Gắn event listener
        checkInForm.addEventListener('submit', (e) => this.handleCheckIn(e, empIdInput.value));
        container.appendChild(checkInForm);

        // Form check-out
        const checkOutForm = document.createElement('form');
        const empIdInput2 = document.createElement('input');
        empIdInput2.type = 'text';
        empIdInput2.placeholder = 'ID Nhân Viên';
        const checkOutBtn = document.createElement('button');
        checkOutBtn.textContent = 'Check Out';
        checkOutBtn.type = 'submit';
        checkOutForm.append(empIdInput2, checkOutBtn);
        // Gắn event listener
        checkOutForm.addEventListener('submit', (e) => this.handleCheckOut(e, empIdInput2.value));
        container.appendChild(checkOutForm);

        // Form tạo báo cáo
        const reportForm = document.createElement('form');
        const empIdInput3 = document.createElement('input');
        empIdInput3.type = 'text';
        empIdInput3.placeholder = 'ID Nhân Viên';
        const fromInput = document.createElement('input');
        fromInput.type = 'date';
        const toInput = document.createElement('input');
        toInput.type = 'date';
        const reportBtn = document.createElement('button');
        reportBtn.textContent = 'Tạo Báo Cáo';
        reportBtn.type = 'submit';
        reportForm.append(empIdInput3, fromInput, toInput, reportBtn);
        // Gắn event listener
        reportForm.addEventListener('submit', (e) => this.handleReport(e, empIdInput3.value, fromInput.value, toInput.value));
        container.appendChild(reportForm);

        // Div chứa báo cáo
        const reportDiv = document.createElement('div');
        reportDiv.id = 'report';
        container.appendChild(reportDiv);
    },

    // Hàm xử lý check-in
    async handleCheckIn(e, empId) {
        e.preventDefault();
        try {
            await this.checkIn(empId);
            alert('Đã check in');
        } catch (err) {
            alert('Check in thất bại: ' + err.message);
        }
    },

    // Hàm xử lý check-out
    async handleCheckOut(e, empId) {
        e.preventDefault();
        try {
            await this.checkOut(empId);
            alert('Đã check out');
        } catch (err) {
            alert('Check out thất bại: ' + err.message);
        }
    },

    // Hàm xử lý tạo báo cáo
    handleReport(e, empId, from, to) {
        e.preventDefault();
        try {
            const { logs, totalHours } = this.getAttendanceReport(empId, from, to);
            const reportDiv = document.getElementById('report');
            reportDiv.innerHTML = `<p>Tổng Giờ: ${totalHours.toFixed(2)}</p>`;
            // Tạo bảng hiển thị báo cáo
            const table = document.createElement('table');
            const header = document.createElement('tr');
            ['Ngày', 'Check In', 'Check Out'].forEach(h => {
                const th = document.createElement('th');
                th.textContent = h;
                header.appendChild(th);
            });
            table.appendChild(header);
            // Thêm dữ liệu từng bản ghi
            logs.forEach(log => {
                const row = document.createElement('tr');
                [log.date, new Date(log.checkIn).toLocaleString(), new Date(log.checkOut).toLocaleString()].forEach(val => {
                    const td = document.createElement('td');
                    td.textContent = val;
                    row.appendChild(td);
                });
                table.appendChild(row);
            });
            reportDiv.appendChild(table);
        } catch (err) {
            alert('Tạo báo cáo thất bại: ' + err.message);
        }
    }
};
