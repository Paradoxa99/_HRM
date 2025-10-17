Tổng quan

Đây là một ứng dụng Quản lý Nhân sự (HRM) được xây dựng hoàn toàn bằng JavaScript thuần, HTML, và CSS. Ứng dụng tập trung vào việc sử dụng các tính năng nâng cao của JavaScript và lưu trữ dữ liệu bền vững thông qua localStorage.

Tính năng

Quản lý Nhân viên: Xem, thêm, chỉnh sửa và xóa thông tin nhân viên.

Quản lý Phòng ban: Quản lý danh sách phòng ban, bao gồm thêm, sửa và xóa.

Quản lý Chấm công: Thực hiện chấm công (check-in/check-out) cho nhân viên.

Giao diện Responsive: Giao diện được thiết kế thân thiện, dễ sử dụng và tương thích với nhiều thiết bị.

Cấu trúc Thư mục

src/index.html: Tệp HTML chính, liên kết đến main.js.

src/pages/dashboard.html: Trang tổng quan, chứa phần điều hướng.

src/pages/employees.html: Giao diện quản lý nhân viên.

src/pages/departments.html: Giao diện quản lý phòng ban.

src/pages/attendance.html: Giao diện quản lý chấm công.

src/css/style.css: Tệp CSS chứa các kiểu cơ bản cho ứng dụng.

src/css/forms.css: Kiểu dáng cho các biểu mẫu (form).

src/css/dashboard.css: Kiểu dáng dành riêng cho dashboard.

src/js/main.js: Tệp JavaScript chính, chứa logic điều khiển ứng dụng.

src/js/models/: Chứa các module dữ liệu như nhân viên, phòng ban, chấm công.

src/js/controllers/: Chứa các bộ điều khiển (controllers) kết nối dữ liệu và giao diện.

src/js/utils/: Chứa các hàm tiện ích (utility) cho lưu trữ và kiểm tra dữ liệu.

Hướng dẫn Cài đặt

Sao chép (clone) dự án về máy.

Mở tệp index.html bằng trình duyệt web để khởi chạy ứng dụng.

Đảm bảo trình duyệt của bạn hỗ trợ localStorage để ứng dụng hoạt động đầy đủ.

Giấy phép

Dự án này được phát hành theo Giấy phép MIT (MIT License).
