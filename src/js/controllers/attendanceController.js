import { checkIn, checkOut, getAttendanceReport } from '../models/attendance.js';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/storage.js';

export class AttendanceController {
    constructor() {
        this.attendance = [];
    }

    async getPresentToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.attendance.filter(a => a.date === today).length;
    }

    async markAttendance(employeeId) {
        this.attendance.push({
            employeeId,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0]
        });
    }

    async getAttendanceReport() {
        return this.attendance;
    }
}

export function initAttendanceModule() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Quản lý điểm danh</h2>
        <div class="attendance-controls">
            <button id="markAttendance">Điểm danh</button>
            <table id="attendanceTable">
                <thead>
                    <tr>
                        <th>Nhân viên</th>
                        <th>Ngày</th>
                        <th>Giờ vào</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;
}
