// Import các module cần thiết
import { EmployeeDbModule } from './employeeDbModule.js';
import { DepartmentModule } from './departmentModule.js';

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

    // Hàm check-in cho cả phòng ban
    async checkInDepartment(departmentId) {
        const employees = EmployeeDbModule.getAllEmployees().filter(emp => emp.departmentId === departmentId);
        const promises = employees.map(emp => this.checkIn(emp.id).catch(() => {})); // Ignore errors for individual employees
        await Promise.all(promises);
    },

    // Hàm check-out cho cả phòng ban
    async checkOutDepartment(departmentId) {
        const employees = EmployeeDbModule.getAllEmployees().filter(emp => emp.departmentId === departmentId);
        const promises = employees.map(emp => this.checkOut(emp.id).catch(() => {})); // Ignore errors for individual employees
        await Promise.all(promises);
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
        container.innerHTML = `
            <h2>Chấm Công</h2>
            <div id="attendance-content"></div>
        `;

        this.showAttendanceView();
    },

    // Hiển thị view chấm công chính
    showAttendanceView() {
        const content = document.getElementById('attendance-content');
        const allEmployees = EmployeeDbModule.getAllEmployees().sort((a, b) => {
            if (a.departmentId !== b.departmentId) {
                return a.departmentId.localeCompare(b.departmentId);
            }
            return a.name.localeCompare(b.name);
        });
        const departments = DepartmentModule.getAllDepartments();
        const today = new Date().toISOString().split('T')[0];
        const attendanceLogs = this.getAttendance().filter(log => log.date === today);

        // Lọc nhân viên theo phòng ban được chọn
        const selectedDeptId = document.getElementById('department-select')?.value || '';
        const employees = selectedDeptId ? allEmployees.filter(emp => emp.departmentId === selectedDeptId) : allEmployees;

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">Chấm Công Ngày ${new Date().toLocaleDateString('vi-VN')}</h3>
                <div>
                    <select id="department-select" style="margin-right: 10px; padding: 8px;">
                        <option value="">Tất Cả Phòng Ban</option>
                        ${departments.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('')}
                    </select>
                    <button id="checkin-dept-btn" class="action-btn" style="background-color: #4CAF50; color: white; padding: 8px 16px; margin-right: 5px;">Check In Phòng Ban</button>
                    <button id="checkout-dept-btn" class="action-btn" style="background-color: #FF9800; color: white; padding: 8px 16px;">Check Out Phòng Ban</button>
                </div>
            </div>
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Phòng Ban</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Báo Cáo</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(emp => {
                        const dept = departments.find(d => d.id === emp.departmentId);
                        const todayLog = attendanceLogs.find(log => log.employeeId === emp.id);
                        const checkInTime = todayLog?.checkIn ? new Date(todayLog.checkIn).toLocaleTimeString('vi-VN') : '';
                        const checkOutTime = todayLog?.checkOut ? new Date(todayLog.checkOut).toLocaleTimeString('vi-VN') : '';
                        return `
                            <tr>
                                <td>${emp.id}</td>
                                <td>${emp.name}</td>
                                <td>${dept ? dept.name : 'N/A'}</td>
                                <td>${checkInTime}</td>
                                <td>${checkOutTime}</td>
                                <td><button class="report-btn action-btn" data-id="${emp.id}" style="background-color: #9C27B0; color: white;">Báo Cáo</button></td>
                                <td>
                                    <button class="checkin-btn action-btn" data-id="${emp.id}" ${todayLog?.checkIn ? 'disabled' : ''} style="background-color: #4CAF50; color: white; margin-right: 5px;">Check In</button>
                                    <button class="checkout-btn action-btn" data-id="${emp.id}" ${!todayLog?.checkIn || todayLog?.checkOut ? 'disabled' : ''} style="background-color: #FF9800; color: white;">Check Out</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        // Gắn event listeners
        content.querySelectorAll('.checkin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleIndividualCheckIn(e.target.dataset.id));
        });
        content.querySelectorAll('.checkout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleIndividualCheckOut(e.target.dataset.id));
        });
        content.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showEmployeeReport(e.target.dataset.id));
        });

        document.getElementById('checkin-dept-btn').addEventListener('click', () => this.handleDepartmentCheckIn());
        document.getElementById('checkout-dept-btn').addEventListener('click', () => this.handleDepartmentCheckOut());

        // Event listener cho department select
        document.getElementById('department-select').addEventListener('change', () => this.showAttendanceView());
    },

    // Xử lý check-in cá nhân
    async handleIndividualCheckIn(employeeId) {
        try {
            await this.checkIn(employeeId);
            alert('Check in thành công!');
            this.showAttendanceView(); // Refresh view
        } catch (error) {
            alert('Check in thất bại: ' + error.message);
        }
    },

    // Xử lý check-out cá nhân
    async handleIndividualCheckOut(employeeId) {
        try {
            await this.checkOut(employeeId);
            alert('Check out thành công!');
            this.showAttendanceView(); // Refresh view
        } catch (error) {
            alert('Check out thất bại: ' + error.message);
        }
    },

    // Xử lý check-in phòng ban
    async handleDepartmentCheckIn() {
        const deptId = document.getElementById('department-select').value;
        if (!deptId) {
            alert('Vui lòng chọn phòng ban!');
            return;
        }

        if (!confirm('Bạn có chắc muốn check in cho toàn bộ phòng ban này?')) return;

        try {
            await this.checkInDepartment(deptId);
            alert('Check in phòng ban thành công!');
            this.showAttendanceView(); // Refresh view
        } catch (error) {
            alert('Check in phòng ban thất bại: ' + error.message);
        }
    },

    // Xử lý check-out phòng ban
    async handleDepartmentCheckOut() {
        const deptId = document.getElementById('department-select').value;
        if (!deptId) {
            alert('Vui lòng chọn phòng ban!');
            return;
        }

        if (!confirm('Bạn có chắc muốn check out cho toàn bộ phòng ban này?')) return;

        try {
            await this.checkOutDepartment(deptId);
            alert('Check out phòng ban thành công!');
            this.showAttendanceView(); // Refresh view
        } catch (error) {
            alert('Check out phòng ban thất bại: ' + error.message);
        }
    },

    // Hiển thị báo cáo của nhân viên
    showEmployeeReport(employeeId) {
        const employee = EmployeeDbModule.getEmployeeById(employeeId);
        if (!employee) {
            alert('Không tìm thấy nhân viên!');
            return;
        }

        const content = document.getElementById('attendance-content');
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        try {
            const { logs, totalHours } = this.getAttendanceReport(employeeId, firstDayOfMonth, lastDayOfMonth);

            content.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">Báo Cáo Chấm Công - ${employee.name}</h3>
                    <button id="back-to-attendance-btn" class="action-btn" style="background-color: #666; color: white; padding: 10px 20px;">Quay Lại</button>
                </div>
                <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                    <p><strong>Tháng:</strong> ${today.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</p>
                    <p><strong>Tổng số giờ làm việc:</strong> ${totalHours.toFixed(2)} giờ</p>
                    <p><strong>Số ngày có mặt:</strong> ${logs.length} ngày</p>
                </div>
                <table class="attendance-table">
                    <thead>
                        <tr>
                            <th>Ngày</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Giờ Làm Việc</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => {
                            const hours = ((log.checkOut - log.checkIn) / 3600000).toFixed(2);
                            return `
                                <tr>
                                    <td>${new Date(log.date).toLocaleDateString('vi-VN')}</td>
                                    <td>${new Date(log.checkIn).toLocaleTimeString('vi-VN')}</td>
                                    <td>${new Date(log.checkOut).toLocaleTimeString('vi-VN')}</td>
                                    <td>${hours} giờ</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;

            document.getElementById('back-to-attendance-btn').addEventListener('click', () => this.showAttendanceView());
        } catch (error) {
            alert('Lỗi khi tạo báo cáo: ' + error.message);
        }
    }
};
