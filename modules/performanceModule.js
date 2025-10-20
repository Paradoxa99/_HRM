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
    async addReview(employeeId, rating, feedback, bonusDeductionType, amount) {
        if (rating < 1 || rating > 5 || !feedback.trim()) {
            throw new Error('Rating 1-5, feedback required');
        }
        const reviews = this.getReviews();
        // Thêm đánh giá mới với ngày hiện tại
        reviews.push({ employeeId, date: new Date().toISOString().split('T')[0], rating, feedback: feedback.trim(), bonusDeductionType, amount });
        await this.saveReviews(reviews);
    },

    // Hàm tính điểm đánh giá trung bình
    getAverageRating(employeeId) {
        const reviews = this.getReviews().filter(r => r.employeeId === employeeId);
        if (reviews.length === 0) return 0;
        return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    },

    // Hàm tính thưởng/khấu trừ dựa trên các đánh giá
    calculateBonusDeduction(employeeId) {
        const reviews = this.getReviews().filter(r => r.employeeId === employeeId);
        let totalBonus = 0;
        let totalDeduction = 0;
        reviews.forEach(review => {
            if (review.bonusDeductionType === 'bonus' && review.amount) {
                totalBonus += review.amount;
            } else if (review.bonusDeductionType === 'deduction' && review.amount) {
                totalDeduction += review.amount;
            }
        });
        if (totalBonus > 0 && totalDeduction > 0) {
            return `Thưởng: ${totalBonus}, Khấu Trừ: ${totalDeduction}`;
        } else if (totalBonus > 0) {
            return `Thưởng: ${totalBonus}`;
        } else if (totalDeduction > 0) {
            return `Khấu Trừ: ${totalDeduction}`;
        } else {
            return 'Không';
        }
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
        const bonusDeductionSelect = document.createElement('select');
        bonusDeductionSelect.id = 'bonus-deduction-select';
        bonusDeductionSelect.innerHTML = '<option value="">Chọn Thưởng/Khấu Trừ</option>';
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.placeholder = 'Số Tiền';
        amountInput.disabled = true;
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Thêm Đánh Giá';
        addBtn.type = 'submit';
        addForm.append(empIdInput, ratingInput, feedbackInput, bonusDeductionSelect, amountInput, addBtn);
        // Gắn event listener cho form
        ratingInput.addEventListener('change', () => this.updateBonusDeductionOptions(bonusDeductionSelect, empIdInput.value, parseInt(ratingInput.value)));
        bonusDeductionSelect.addEventListener('change', () => {
            amountInput.disabled = bonusDeductionSelect.value === '';
            if (bonusDeductionSelect.value) {
                const employees = JSON.parse(localStorage.getItem('employees') || '[]');
                const employee = employees.find(emp => emp.id === empIdInput.value);
                if (employee) {
                    amountInput.max = employee.salary * 0.5;
                    amountInput.placeholder = `Tối đa ${employee.salary * 0.5}`;
                }
            }
        });
        addForm.addEventListener('submit', (e) => this.handleAdd(e, empIdInput.value, parseInt(ratingInput.value), feedbackInput.value, bonusDeductionSelect.value, parseFloat(amountInput.value)));
        container.appendChild(addForm);

        // Lấy danh sách nhân viên và tạo báo cáo
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const report = employees.map(emp => ({
            ...emp,
            averageRating: this.getAverageRating(emp.id),
            reviews: this.getReviews().filter(r => r.employeeId === emp.id),
            bonusDeduction: this.calculateBonusDeduction(emp.id)
        })).sort((a, b) => b.averageRating - a.averageRating);

        // Tạo bảng hiển thị báo cáo
        const table = document.createElement('table');
        const header = document.createElement('tr');
        ['Tên', 'Đánh Giá Trung Bình', 'Thưởng/Khấu Trừ', 'Đánh Giá'].forEach(h => {
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
            const bonusDeductionTd = document.createElement('td');
            bonusDeductionTd.textContent = emp.bonusDeduction;
            const reviewsTd = document.createElement('td');
            reviewsTd.textContent = emp.reviews.map(r => `${r.date}: ${r.rating} - ${r.feedback}`).join('; ');
            row.append(nameTd, avgTd, bonusDeductionTd, reviewsTd);
            table.appendChild(row);
        });
        container.appendChild(table);
    },

    // Hàm cập nhật options thưởng/khấu trừ dựa trên rating
    updateBonusDeductionOptions(select, empId, rating) {
        select.innerHTML = '<option value="">Chọn Thưởng/Khấu Trừ</option>';
        if (rating >= 4) {
            select.innerHTML += '<option value="bonus">Thưởng</option>';
        } else if (rating <= 2) {
            select.innerHTML += '<option value="deduction">Khấu Trừ</option>';
        }
    },

    // Hàm xử lý thêm đánh giá
    async handleAdd(e, empId, rating, feedback, bonusDeductionType, amount) {
        e.preventDefault();
        try {
            if (bonusDeductionType && (amount <= 0 || isNaN(amount))) {
                throw new Error('Số tiền phải > 0');
            }
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const employee = employees.find(emp => emp.id === empId);
            if (!employee) {
                throw new Error('Nhân viên không tồn tại');
            }
            if (amount > employee.salary * 0.5) {
                throw new Error('Số tiền không được vượt quá 50% lương cơ bản');
            }
            await this.addReview(empId, rating, feedback, bonusDeductionType, amount);
            alert('Đã thêm đánh giá');
            // Render lại giao diện
            this.render();
        } catch (err) {
            alert('Thêm thất bại: ' + err.message);
        }
    }
};