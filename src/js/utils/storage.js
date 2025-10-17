export class StorageService {
    constructor(key) {
        // Phiên bản hiện tại của storage
        this.VERSION = '1.0';
        this.storageKey = key; // Store the key for getData/saveData methods
    }

    // Methods expected by DepartmentController
    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    async get(key) {
        try {
            // Lấy dữ liệu từ localStorage
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Lỗi khi lấy dữ liệu ${key}:`, error);
            return null;
        }
    }

    async set(key, value) {
        try {
            if (typeof key !== 'string') {
                throw new Error('Key must be a string');
            }
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`Lỗi khi lưu dữ liệu ${key}:`, error);
            return false;
        }
    }

    async delete(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Lỗi khi xóa dữ liệu ${key}:`, error);
            return false;
        }
    }

    async getEmployees() {
        return await this.get('employees') || [];
    }

    async getDepartments() {
        return await this.get('departments') || [];
    }

    async getAttendance() {
        return await this.get('attendance') || [];
    }

    async saveEmployees(employees) {
        return await this.set('employees', employees);
    }

    async saveDepartments(departments) {
        return await this.set('departments', departments);
    }

    async saveAttendance(attendance) {
        return await this.set('attendance', attendance);
    }

    async clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Lỗi khi xóa dữ liệu:', error);
            return false;
        }
    }

    async isStorageAvailable() {
        try {
            // Kiểm tra xem localStorage có khả dụng không
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Tạo một instance duy nhất
const storage = new StorageService();

// Helper functions that match what attendanceController expects
export function saveToLocalStorage(key, value) {
    return storage.set(key, value);
}

export function getFromLocalStorage(key) {
    return storage.get(key);
}

export { storage };

// Xử lý lưu trữ local

// filepath: d:\HTML_JS_CSS\Assigment\new\hrm-app\src\js\utils\validation.js
// Các hàm validation:
// - isNotEmpty(): Kiểm tra rỗng
// - isEmailValid(): Kiểm tra email
// - isPhoneNumberValid(): Kiểm tra số điện thoại
// - isDateValid(): Kiểm tra ngày tháng
