const ATTENDANCE_KEY = 'attendanceRecords';

export function checkIn(employeeId) {
    const attendanceRecords = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
    const record = {
        employeeId,
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
    };
    attendanceRecords.push(record);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceRecords));
}

export function checkOut(employeeId) {
    const attendanceRecords = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
    const record = attendanceRecords.find(r => r.employeeId === employeeId && r.checkOutTime === null);
    if (record) {
        record.checkOutTime = new Date().toISOString();
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceRecords));
    }
}

export function getAttendanceReport() {
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
}