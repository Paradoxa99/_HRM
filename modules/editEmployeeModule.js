// Import các module cần thiết
import { EmployeeDbModule } from './employeeDbModule.js';
import { DepartmentModule } from './departmentModule.js';
import { PositionModule } from './positionModule.js';

export const EditEmployeeModule = {
    currentEmployee: null,

    // Hàm render giao diện chỉnh sửa nhân viên
    render() {
        const container = document.getElementById('main-content');
        container.innerHTML = '<h2>Chỉnh Sửa Nhân Viên</h2>';
        // Tạo form tìm kiếm nhân viên
        const searchForm = document.createElement('form');
        searchForm.id = 'search-form';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'search-id';
        searchInput.placeholder = 'Nhập ID hoặc Tên Nhân Viên';
        const searchBtn = document.createElement('button');
        searchBtn.textContent = 'Tìm Kiếm';
        searchBtn.type = 'submit';
        searchForm.append(searchInput, searchBtn);
        container.appendChild(searchForm);

        // Tạo div chứa form chỉnh sửa
        const editDiv = document.createElement('div');
        editDiv.id = 'edit-form';
        editDiv.style.display = 'none';
        container.appendChild(editDiv);

        // Gắn event listener cho form tìm kiếm
        searchForm.addEventListener('submit', this.handleSearch.bind(this));
    },

    // Hàm xử lý tìm kiếm nhân viên
    handleSearch(e) {
        e.preventDefault();
        const query = document.getElementById('search-id').value.trim();
        let employee;
        try {
            // Tìm theo tên hoặc ID
            employee = isNaN(query) ? EmployeeDbModule.filterEmployees(e => e.name.toLowerCase().includes(query.toLowerCase()))[0] : EmployeeDbModule.getEmployeeById(query);
        } catch {
            alert('Không tìm thấy nhân viên');
            return;
        }
        if (!employee) {
            alert('Không tìm thấy nhân viên');
            return;
        }
        this.currentEmployee = () => employee;
        // Hiển thị form chỉnh sửa
        this.renderEditForm(employee);
    },

    // Hàm render form chỉnh sửa nhân viên
    renderEditForm(employee) {
        const form = document.getElementById('edit-form');
        form.innerHTML = '';
        // Tạo input cho tên
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = employee.name;
        // Tạo select cho phòng ban
        const deptSelect = document.createElement('select');
        DepartmentModule.getAllDepartments().forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            if (d.id === employee.departmentId) opt.selected = true;
            deptSelect.appendChild(opt);
        });
        // Tạo select cho vị trí
        const posSelect = document.createElement('select');
        PositionModule.getAllPositions().forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.title;
            if (p.id === employee.positionId) opt.selected = true;
            posSelect.appendChild(opt);
        });
        // Tạo select cho phụ cấp
        const allowanceSelect = this.createAllowanceSelect(employee.allowance);
        // Tạo input cho ngày thuê
        const hireDateInput = document.createElement('input');
        hireDateInput.type = 'date';
        hireDateInput.value = employee.hireDate;
        // Tạo nút cập nhật
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Cập Nhật';
        submitBtn.type = 'submit';
        form.append(nameInput, deptSelect, posSelect, allowanceSelect, hireDateInput, submitBtn);
        // Gắn event listener cho form
        form.addEventListener('submit', (e) => this.handleUpdate(e, employee.id, employee));
        form.style.display = 'block';
    },

    // Hàm tạo select cho phụ cấp
    createAllowanceSelect(currentAllowance) {
        const select = document.createElement('select');
        select.id = 'allowance';
        select.required = true;
        // Tạo option mặc định
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Chọn Phụ Cấp';
        select.appendChild(defaultOpt);
        // Thêm các option phụ cấp
        const allowances = [0, 5, 10, 15, 20];
        allowances.forEach(percent => {
            const option = document.createElement('option');
            option.value = percent;
            option.textContent = `${percent}%`;
            if (percent === currentAllowance) option.selected = true;
            select.appendChild(option);
        });
        return select;
    },

    // Hàm xử lý cập nhật nhân viên
    async handleUpdate(e, id, employee) {
        e.preventDefault();
        if (!confirm('Bạn chắc chắn muốn cập nhật?')) return;
        // Thu thập dữ liệu từ form
        const name = document.querySelector('#edit-form input[type="text"]').value.trim();
        const departmentId = document.querySelector('#edit-form select:nth-child(2)').value;
        const positionId = document.querySelector('#edit-form select:nth-child(3)').value;
        const allowance = parseFloat(document.querySelector('#edit-form select:nth-child(4)').value) || 0;
        const hireDate = document.querySelector('#edit-form input[type="date"]').value;

        // Lấy lương cơ bản từ vị trí và tính phụ cấp theo %
        const position = PositionModule.getAllPositions().find(p => p.id === positionId);
        const baseSalary = position ? position.salaryBase : 0;
        const allowanceAmount = baseSalary * (allowance / 100);
        const totalSalary = baseSalary + allowanceAmount;

        // Validate dữ liệu
        if (!name || !departmentId || !positionId || allowance < 0 || !Date.parse(hireDate) ||
            !DepartmentModule.getAllDepartments().some(d => d.id === departmentId) ||
            !PositionModule.getAllPositions().some(p => p.id === positionId)) {
            alert('Dữ liệu không hợp lệ');
            return;
        }

        // Validate phụ cấp không vượt quá 20%
        if (allowance > 20) {
            alert('Phụ cấp không được vượt quá 20%');
            return;
        }

        const updates = {
            name,
            departmentId,
            positionId,
            salary: totalSalary,
            hireDate,
            allowance
        };

        try {
            // Cập nhật nhân viên
            await EmployeeDbModule.updateEmployee(id, updates);
            alert('Cập nhật nhân viên thành công');
            // Phát sự kiện refresh
            window.dispatchEvent(new Event('refresh'));
        } catch (err) {
            alert('Cập nhật thất bại: ' + err.message);
        }
    }
};
