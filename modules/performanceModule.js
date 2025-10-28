// Import module cần thiết
import { EmployeeDbModule } from './employeeDbModule.js';

export const PerformanceModule = {
    // Hàm lấy danh sách đánh giá hiệu suất
    getReviews() {
        try {
            return JSON.parse(localStorage.getItem('reviews') || '[]');
        } catch {
            return [];
        }
    },

    // Hàm thêm đánh giá hiệu suất
    async addReview(employeeId, rating, feedback) {
        if (rating < 1 || rating > 5 || !feedback.trim()) {
            throw new Error('Rating 1-5, feedback required');
        }
        const reviews = this.getReviews();
        // Thêm đánh giá mới với ngày hiện tại
        reviews.push({ employeeId, date: new Date().toISOString().split('T')[0], rating, feedback: feedback.trim() });
        await this.saveReviews(reviews);
    },

    // Hàm tính điểm đánh giá trung bình
    getAverageRating(employeeId) {
        const reviews = this.getReviews().filter(r => r.employeeId === employeeId);
        if (reviews.length === 0) return 0;
        return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    },

    // Hàm tính thưởng/khấu trừ dựa trên các đánh giá (bỏ đi, chỉ giữ lại tính điểm trung bình)
    calculateBonusDeduction(employeeId) {
        // Không còn tính thưởng/khấu trừ từ đánh giá
        return 'Không';
    },

    // Hàm lưu danh sách đánh giá
    async saveReviews(reviews) {
        await new Promise(resolve => setTimeout(resolve, 100));
        localStorage.setItem('reviews', JSON.stringify(reviews));
    },

    // Hàm render giao diện đánh giá hiệu suất
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = '<h2>Đánh Giá Hiệu Suất</h2>';

        // Tạo form thêm đánh giá
        const addForm = document.createElement('form');
        addForm.id = 'add-review-form';
        const empIdInput = document.createElement('input');
        empIdInput.type = 'text';
        empIdInput.placeholder = 'ID Nhân Viên';
        const ratingInput = document.createElement('input');
        ratingInput.type = 'number';
        ratingInput.min = 1;
        ratingInput.max = 5;
        ratingInput.placeholder = 'Đánh Giá (1-5)';
        const feedbackInput = document.createElement('textarea');
        feedbackInput.placeholder = 'Phản Hồi';
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Thêm Đánh Giá';
        addBtn.type = 'submit';
        addForm.append(empIdInput, ratingInput, feedbackInput, addBtn);
        // Gắn event listener cho form
        addForm.addEventListener('submit', (e) => this.handleAdd(e, empIdInput.value, parseInt(ratingInput.value), feedbackInput.value));
        container.appendChild(addForm);

        // Lấy danh sách nhân viên và tạo báo cáo
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const report = employees.map(emp => ({
            ...emp,
            averageRating: this.getAverageRating(emp.id),
            reviews: this.getReviews().filter(r => r.employeeId === emp.id)
        })).sort((a, b) => b.averageRating - a.averageRating);

        // Tạo bảng hiển thị báo cáo
        const table = document.createElement('table');
        const header = document.createElement('tr');
        ['Tên', 'Đánh Giá Trung Bình', 'Đánh Giá'].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            header.appendChild(th);
        });
        table.appendChild(header);
        // Thêm dữ liệu từng nhân viên
        report.forEach(emp => {
            const row = document.createElement('tr');
            const nameTd = document.createElement('td');
            nameTd.textContent = emp.name;
            const avgTd = document.createElement('td');
            avgTd.textContent = emp.averageRating.toFixed(1);
            const reviewsTd = document.createElement('td');
            reviewsTd.textContent = emp.reviews.map(r => `${r.date}: ${r.rating} - ${r.feedback}`).join('; ');
            row.append(nameTd, avgTd, reviewsTd);
            table.appendChild(row);
        });
        container.appendChild(table);
    },



    // Hàm xử lý thêm đánh giá
    async handleAdd(e, empId, rating, feedback) {
        e.preventDefault();
        try {
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const employee = employees.find(emp => emp.id === empId);
            if (!employee) {
                throw new Error('Nhân viên không tồn tại');
            }
            await this.addReview(empId, rating, feedback);
            alert('Đã thêm đánh giá');
            // Render lại giao diện
            this.render();
        } catch (err) {
            alert('Thêm thất bại: ' + err.message);
        }
    }
};