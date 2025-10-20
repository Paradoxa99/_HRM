// Import module cần thiết
import { EmployeeDbModule } from './employeeDbModule.js';

export const SalaryModule = {
    // Hàm tính lương thực nhận
    calculateNetSalary(employee) {
        // Tính thưởng/khấu trừ từ đánh giá hiệu suất
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]').filter(r => r.employeeId === employee.id);
        let performanceBonus = 0;
        let performanceDeduction = 0;
        reviews.forEach(review => {
            if (review.bonusDeductionType === 'bonus' && review.amount) {
                performanceBonus += review.amount;
            } else if (review.bonusDeductionType === 'deduction' && review.amount) {
                performanceDeduction += review.amount;
            }
        });
        return employee.salary + performanceBonus - performanceDeduction;
    },

    // Hàm tạo báo cáo bảng lương
    generatePayrollReport() {
        const employees = EmployeeDbModule.getAllEmployees();
        // Tính lương thực nhận cho từng nhân viên
        const report = employees.map(emp => ({
            ...emp,
            netSalary: this.calculateNetSalary(emp)
        }));
        // Tính tổng lương
        const total = report.reduce((sum, emp) => sum + emp.netSalary, 0);
        return { report, total };
    },

    // Hàm render giao diện quản lý lương
    render() {
        const { report, total } = this.generatePayrollReport();
        const container = document.getElementById('main-content');
        container.innerHTML = `<h2>Quản Lý Lương</h2><p>Tổng Lương: ${total}</p>`;
        // Tạo bảng hiển thị báo cáo lương
        const table = document.createElement('table');
        const header = document.createElement('tr');
        ['Tên', 'Lương Cơ Bản', 'Thưởng/Khấu Trừ Từ Đánh Giá', 'Lương Thực Nhận'].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            header.appendChild(th);
        });
        table.appendChild(header);
        // Thêm dữ liệu từng nhân viên
        report.forEach(emp => {
            const reviews = JSON.parse(localStorage.getItem('reviews') || '[]').filter(r => r.employeeId === emp.id);
            let performanceBonus = 0;
            let performanceDeduction = 0;
            reviews.forEach(review => {
                if (review.bonusDeductionType === 'bonus' && review.amount) {
                    performanceBonus += review.amount;
                } else if (review.bonusDeductionType === 'deduction' && review.amount) {
                    performanceDeduction += review.amount;
                }
            });
            const performanceText = performanceBonus > 0 && performanceDeduction > 0 ? `+${performanceBonus} / -${performanceDeduction}` : performanceBonus > 0 ? `+${performanceBonus}` : performanceDeduction > 0 ? `-${performanceDeduction}` : '0';
            const row = document.createElement('tr');
            [emp.name, emp.salary, performanceText, emp.netSalary].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val;
                row.appendChild(td);
            });
            table.appendChild(row);
        });
        container.appendChild(table);
    }
};