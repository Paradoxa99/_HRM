// Import các module cần thiết
import { EmployeeDbModule } from './employeeDbModule.js';
import { DepartmentModule } from './departmentModule.js';
import { PositionModule } from './positionModule.js';

export const AddEmployeeModule = {
    // Hàm render giao diện thêm nhân viên
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = '<h2>Thêm Nhân Viên</h2>';
        const form = document.createElement('form');
        form.id = 'add-employee-form';

        // Tạo các input và select cho form
        const nameInput = this.createInput('text', 'name', 'Tên Nhân Viên', true);
        const salaryInput = this.createInput('number', 'salary', 'Lương Cơ Bản', true);
        const hireDateInput = this.createInput('date', 'hireDate', 'Ngày Thuê', true);
        const deptSelect = this.createSelect('departmentId', DepartmentModule.getAllDepartments(), 'Chọn Phòng Ban');
        const posSelect = this.createSelect('positionId', PositionModule.getAllPositions(), 'Chọn Vị Trí');
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Thêm';
        submitBtn.type = 'submit';

        // Thêm các element vào form
        form.append(nameInput, deptSelect, posSelect, salaryInput, hireDateInput, submitBtn);
        container.appendChild(form);

        // Gắn event listeners
        form.addEventListener('submit', this.handleSubmit.bind(this));
        salaryInput.addEventListener('input', () => this.validateSalary(salaryInput));
        hireDateInput.addEventListener('change', () => this.validateDate(hireDateInput));
    },

    // Hàm tạo input element
    createInput(type, id, placeholder, required) {
        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.placeholder = placeholder;
        input.required = required;
        return input;
    },

    // Hàm tạo select element với options
    createSelect(id, options, placeholder) {
        const select = document.createElement('select');
        select.id = id;
        select.required = true;
        // Tạo option mặc định
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = placeholder;
        select.appendChild(defaultOpt);
        // Thêm các option từ danh sách
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.id;
            option.textContent = opt.name || opt.title;
            select.appendChild(option);
        });
        return select;
    },

    // Hàm validate lương
    validateSalary(input) {
        const val = parseFloat(input.value);
        input.className = val > 0 ? 'valid' : 'invalid';
        this.showError(input, val <= 0 ? 'Lương phải lớn hơn 0' : '');
    },

    // Hàm validate ngày
    validateDate(input) {
        const val = input.value;
        input.className = Date.parse(val) ? 'valid' : 'invalid';
        this.showError(input, !Date.parse(val) ? 'Ngày không hợp lệ' : '');
    },

    // Hàm hiển thị lỗi
    showError(input, msg) {
        let error = input.nextElementSibling;
        if (!error || !error.classList.contains('error')) {
            error = document.createElement('span');
            error.className = 'error';
            input.parentNode.insertBefore(error, input.nextSibling);
        }
        error.textContent = msg;
    },

    // Hàm tạo mã phòng ban
    generateDepartmentCode(deptName) {
        const words = deptName.split(' ');
        let code = '';
        for (let i = 0; i < Math.min(2, words.length); i++) {
            code += words[i].charAt(0).toUpperCase();
        }
        // Nếu trùng với ID đã có, thêm ký tự từ chữ tiếp theo
        let existingCodes = DepartmentModule.getAllDepartments().map(d => d.id);
        let uniqueCode = code;
        let index = 2;
        while (existingCodes.includes(uniqueCode)) {
            if (index < words.length) {
                uniqueCode += words[index].charAt(0).toUpperCase();
                index++;
            } else {
                // Nếu hết chữ, thêm số
                uniqueCode += '1';
            }
        }
        return uniqueCode;
    },

    // Hàm tạo ID nhân viên
    generateEmployeeId(deptId) {
        const dept = DepartmentModule.getAllDepartments().find(d => d.id === deptId);
        if (!dept) throw new Error('Department not found');
        const code = this.generateDepartmentCode(dept.name);
        let id;
        do {
            const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
            id = code + randomDigits.toString();
        } while (EmployeeDbModule.getAllEmployees().some(e => e.id === id));
        return id;
    },

    // Hàm xử lý submit form
    async handleSubmit(e) {
        e.preventDefault();
        // Lấy giá trị từ form
        const name = document.getElementById('name').value.trim();
        const deptId = document.getElementById('departmentId').value;
        const posId = document.getElementById('positionId').value;
        const salary = parseFloat(document.getElementById('salary').value);
        const hireDate = document.getElementById('hireDate').value;

        // Validate dữ liệu
        if (!name || !deptId || !posId || salary <= 0 || !Date.parse(hireDate) ||
            !DepartmentModule.getAllDepartments().some(d => d.id === deptId) ||
            !PositionModule.getAllPositions().some(p => p.id === posId)) {
            alert('Dữ liệu không hợp lệ');
            return;
        }

        // Tạo ID nhân viên mới
        const id = this.generateEmployeeId(deptId);

        // Tạo object nhân viên mới
        const employee = { id, name, departmentId: deptId, positionId: posId, salary, hireDate, bonus: 0, deduction: 0 };
        try {
            // Thêm nhân viên vào database
            await EmployeeDbModule.addEmployee(employee);
            alert('Thêm nhân viên thành công');
            // Phát sự kiện refresh để cập nhật UI
            window.dispatchEvent(new Event('refresh'));
        } catch (err) {
            alert('Thêm thất bại: ' + err.message);
        }
    }
};
