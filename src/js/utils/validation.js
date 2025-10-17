function isNotEmpty(value) {
    return value.trim() !== '';
}

function isEmailValid(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function isPhoneNumberValid(phone) {
    const phonePattern = /^\d{10}$/; // Adjust the pattern as needed
    return phonePattern.test(phone);
}

function isDateValid(dateString) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
    return datePattern.test(dateString);
}

const errorMessages = {
    required: 'Vui lòng không để trống trường này',
    email: 'Email không hợp lệ',
    phone: 'Số điện thoại không hợp lệ',
    date: 'Ngày tháng không hợp lệ'
};

export function getErrorMessage(type) {
    return errorMessages[type] || 'Dữ liệu không hợp lệ';
}

export { isNotEmpty, isEmailValid, isPhoneNumberValid, isDateValid };

export class ValidationService {
    validateDepartmentName(name) {
        if (!isNotEmpty(name)) {
            throw new Error('Department name is required');
        }
        if (name.length < 2) {
            throw new Error('Department name is too short');
        }
        return true;
    }
}
