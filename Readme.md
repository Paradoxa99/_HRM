# HRM - Human Resource Management System

Ứng dụng quản lý nhân sự hoàn chỉnh xây dựng bằng **Vanilla JavaScript** + **PHP** + **MySQL**.

## 🎯 Tính Năng

✅ Xác thực người dùng (Login/Register)
✅ Quản lý nhân viên (Add/Edit/Delete/Search)
✅ Quản lý phòng ban
✅ Quản lý vị trí công việc
✅ Báo cáo lương
✅ Chấm công hàng ngày
✅ Quản lý nghỉ phép
✅ Đánh giá hiệu suất

## 📂 Cấu Trúc Thư Mục

```
_HRM1/
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── css/
│   │   └── style.css
│   └── modules/
│       ├── authModule.js
│       ├── employeeDbModule.js
│       ├── addEmployeeModule.js
│       ├── editEmployeeModule.js
│       ├── deleteEmployeeModule.js
│       ├── searchEmployeeModule.js
│       ├── departmentModule.js
│       ├── positionModule.js
│       ├── salaryModule.js
│       ├── attendanceModule.js
│       ├── leaveModule.js
│       └── performanceModule.js
├── backend/
│   ├── config.php
│   ├── api.php
│   ├── init.sql
│   ├── models/
│   │   ├── AuthModel.php
│   │   ├── EmployeeModel.php
│   │   ├── DepartmentModel.php
│   │   ├── PositionModel.php
│   │   ├── SalaryModel.php
│   │   ├── AttendanceModel.php
│   │   ├── LeaveModel.php
│   │   └── PerformanceModel.php
│   └── controllers/
│       ├── AuthController.php
│       ├── EmployeeController.php
│       ├── DepartmentController.php
│       ├── PositionController.php
│       ├── SalaryController.php
│       ├── AttendanceController.php
│       ├── LeaveController.php
│       └── PerformanceController.php
└── README.md
```

## 🚀 Hướng Dẫn Cài Đặt

### 1. Chuẩn Bị XAMPP

- Đảm bảo XAMPP đang chạy (Apache + MySQL)
- Thư mục project: `c:\xampp\htdocs\_HRM1`

### 2. Tạo Database

1. Mở phpMyAdmin: http://localhost/phpmyadmin
2. Import file `backend/init.sql`:
   - Copy toàn bộ nội dung init.sql
   - Chạy trong "SQL" tab trong phpMyAdmin

**Hoặc chạy MySQL command trực tiếp:**

```bash
mysql -u root -p < backend/init.sql
```

### 3. Chạy Ứng Dụng

- Truy cập: `http://localhost/_HRM1/frontend/index.html`

## 🔐 Tài Khoản Mặc Định

```
Admin:
- Username: admin
- Password: admin123 (hoặc tương tự)

Manager:
- Username: manager
- Password: manager123
```

## 📖 Hướng Dẫn Sử Dụng

### Đăng Nhập

1. Nhập username và password
2. Click "Đăng nhập"
3. Nếu chưa có tài khoản, click tab "Đăng ký"

### Quản Lý Nhân Viên

- **Thêm**: Điền form, lưu ý lương > 0
- **Sửa**: Tìm kiếm theo ID hoặc tên, cập nhật thông tin
- **Xóa**: Tìm kiếm rồi xác nhận xóa
- **Tìm kiếm**: Lọc theo tên, phòng ban, khoảng lương

### Chấm Công

- Click "Check In" khi nhân viên vào làm
- Click "Check Out" khi nhân viên tan làm
- Xem báo cáo giờ làm trong khoảng thời gian chỉ định

### Quản Lý Lương

- Xem báo cáo lương toàn bộ nhân viên
- Cập nhật thưởng/khấu trừ khi sửa thông tin nhân viên

## 🔧 Công Nghệ Sử Dụng

**Frontend:**

- HTML5, CSS3
- Vanilla JavaScript (ES6+)
- Fetch API

**Backend:**

- PHP 8+
- MySQL (PDO)

**Không sử dụng:** React, Vue, Angular, jQuery, hoặc bất kỳ framework khác

## 🛠️ API Endpoints

| Method | Endpoint                           | Chức Năng            |
| ------ | ---------------------------------- | -------------------- |
| POST   | /api?resource=auth                 | Login/Register       |
| GET    | /api?resource=employees            | Lấy tất cả nhân viên |
| POST   | /api?resource=employees            | Thêm nhân viên       |
| PUT    | /api?resource=employees&id=X       | Cập nhật nhân viên   |
| DELETE | /api?resource=employees&id=X       | Xóa nhân viên        |
| GET    | /api?resource=salary&action=report | Báo cáo lương        |
| POST   | /api?resource=attendance           | Check in/out         |
| POST   | /api?resource=leaves               | Yêu cầu nghỉ phép    |

## 📋 Danh Sách 12 Modules

1. ✅ **Auth Module** - Xác thực người dùng
2. ✅ **Employee DB Module** - CRUD nhân viên từ DB
3. ✅ **Add Employee Module** - Thêm nhân viên
4. ✅ **Edit Employee Module** - Sửa nhân viên
5. ✅ **Delete Employee Module** - Xóa nhân viên
6. ✅ **Search Employee Module** - Tìm kiếm nâng cao
7. ✅ **Department Module** - Quản lý phòng ban
8. ✅ **Position Module** - Quản lý vị trí
9. ✅ **Salary Module** - Quản lý lương
10. ✅ **Attendance Module** - Chấm công
11. ✅ **Leave Module** - Quản lý nghỉ phép
12. ✅ **Performance Module** - Đánh giá hiệu suất

## ✨ Tính Năng Nâng Cao

- 🔒 Hash password với bcrypt
- 📊 Báo cáo lương tổng hợp
- 🗓️ Quản lý lịch nghỉ phép
- ⭐ Đánh giá và xếp hạng nhân viên
- 🔍 Tìm kiếm nâng cao với regex
- 📱 Responsive design

## 🐛 Khắc Phục Lỗi

### Lỗi kết nối MySQL

- Kiểm tra XAMPP đã start MySQL
- Kiểm tra config.php có db name đúng
- Import init.sql thành công

### 404 Not Found

- Kiểm tra đường dẫn URL đúng
- Đảm bảo file backend/api.php tồn tại

### CORS Error

- Header CORS đã được thêm trong config.php

## 📝 Ghi Chú

- Dữ liệu lưu trữ trong MySQL
- Phiên làm việc lưu trong localStorage (token)
- Hết hạn phiên sau 24 giờ
- Mã được comment chi tiết

## 📧 Hỗ Trợ

Nếu gặp lỗi, kiểm tra:

1. Console browser (F12)
2. PHP error_log trong XAMPP
3. MySQL connection

---

**Phiên bản:** 1.0
**Cập nhật:** 2025-11-23
