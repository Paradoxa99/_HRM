CREATE DATABASE hrm_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hrm_database;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager') DEFAULT 'manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions Table
CREATE TABLE positions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    salary_base DECIMAL(10, 2) DEFAULT 0,
    department_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Employees Table
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    position_id INT NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    bonus DECIMAL(10, 2) DEFAULT 0,
    deduction DECIMAL(10, 2) DEFAULT 0,
    hire_date DATE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
);

-- Attendance Table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    work_hours DECIMAL(5, 2),
    attendance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (employee_id, attendance_date)
);

-- Leaves Table
CREATE TABLE leaves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type ENUM('annual', 'sick', 'unpaid') DEFAULT 'annual',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    review_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Users (Password: password)
INSERT INTO users (username, password, role) VALUES
('admin', '$2y$10$aDtAxUXJGreAJywvTTJPY./vUtMxlh6MEtQwq9E8iNmoUG3Z0zIqC', 'admin'),
('manager', '$2y$10$aDtAxUXJGreAJywvTTJPY./vUtMxlh6MEtQwq9E8iNmoUG3Z0zIqC', 'manager');

-- Departments
INSERT INTO departments (name, manager_id) VALUES
('IT', NULL),
('HR', NULL),
('Sales', NULL);

-- Positions
INSERT INTO positions (title, description, salary_base, department_id) VALUES
('Developer', 'Software Developer', 15000, 1),
('Manager', 'Project Manager', 20000, 3),
('HR Specialist', 'Human Resource', 12000, 2);

-- Employees (Basic 5)
INSERT INTO employees (name, department_id, position_id, salary, hire_date, email, phone) VALUES
('John Doe', 1, 1, 15000, '2023-01-15', 'john@example.com', '0901234567'),
('Jane Smith', 2, 3, 12000, '2023-02-20', 'jane@example.com', '0901234568'),
('Bob Johnson', 1, 1, 15000, '2023-03-10', 'bob@example.com', '0901234569'),
('Alice Brown', 3, 2, 20000, '2023-04-05', 'alice@example.com', '0901234570'),
('Charlie Wilson', 1, 1, 15000, '2023-05-12', 'charlie@example.com', '0901234571');

-- Additional Employees (Sample)
INSERT INTO employees (name, department_id, position_id, salary, hire_date, email, phone, bonus, deduction) VALUES
('Nguyễn Văn An', 1, 1, 16000, '2023-06-01', 'van.an@example.com', '0901234572', 500, 200),
('Trần Thị Bình', 2, 3, 13000, '2023-07-15', 'thi.binh@example.com', '0901234573', 300, 100),
('Phạm Văn Cường', 3, 2, 21000, '2023-08-20', 'van.cuong@example.com', '0901234574', 1000, 500),
('Hoàng Thị Dung', 1, 1, 15500, '2023-09-10', 'thi.dung@example.com', '0901234575', 400, 150),
('Lê Văn Đức', 2, 3, 12500, '2023-10-05', 'van.duc@example.com', '0901234576', 250, 100);

-- Attendance
INSERT INTO attendance (employee_id, check_in, check_out, work_hours, attendance_date) VALUES
(1, '2025-11-23 08:00:00', '2025-11-23 17:30:00', 9.5, '2025-11-23'),
(2, '2025-11-23 08:15:00', '2025-11-23 17:15:00', 9.0, '2025-11-23'),
(3, '2025-11-23 07:45:00', '2025-11-23 18:00:00', 10.25, '2025-11-23'),
(4, '2025-11-23 08:30:00', '2025-11-23 17:00:00', 8.5, '2025-11-23'),
(5, '2025-11-23 08:00:00', '2025-11-23 17:30:00', 9.5, '2025-11-23');

-- Leaves
INSERT INTO leaves (employee_id, start_date, end_date, type, status, reason) VALUES
(1, '2025-12-01', '2025-12-03', 'annual', 'pending', 'Lễ gia đình'),
(2, '2025-12-10', '2025-12-10', 'sick', 'pending', 'Ốm'),
(3, '2025-11-25', '2025-11-25', 'annual', 'approved', 'Công việc cá nhân'),
(4, '2025-12-20', '2025-12-20', 'annual', 'pending', 'Du lịch'),
(5, '2025-12-15', '2025-12-15', 'sick', 'approved', 'Khám bệnh');

-- Reviews
INSERT INTO reviews (employee_id, rating, feedback, review_date) VALUES
(1, 5, 'Xuất sắc', '2025-11-23'),
(2, 4, 'Tốt', '2025-11-23'),
(3, 5, 'Xuất sắc', '2025-11-23'),
(4, 4, 'Tốt', '2025-11-23'),
(5, 3, 'Bình thường', '2025-11-23'),
(6, 4, 'Tốt', '2025-11-23'),
(7, 5, 'Xuất sắc', '2025-11-23'),
(8, 4, 'Tốt', '2025-11-23'),
(9, 5, 'Xuất sắc', '2025-11-23'),
(10, 3, 'Bình thường', '2025-11-23');
