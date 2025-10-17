const EMPLOYEE_STORAGE_KEY = 'employees';

export class Employee {
    constructor(id, firstName, lastName, email, departmentId) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.departmentId = departmentId;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}

export function getAllEmployees() {
    const employees = JSON.parse(localStorage.getItem(EMPLOYEE_STORAGE_KEY)) || [];
    return employees;
}

export function addEmployee(employee) {
    if (!employee.firstName || !employee.lastName || !employee.email) {
        throw new Error('Missing required employee fields');
    }

    const employees = getAllEmployees();
    if (employees.some(e => e.email === employee.email)) {
        throw new Error('Employee with this email already exists');
    }

    employee.id = Date.now().toString();
    employees.push(employee);
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
    return employee;
}

export function updateEmployee(updatedEmployee) {
    const employees = getAllEmployees();
    const index = employees.findIndex(emp => emp.id === updatedEmployee.id);
    if (index !== -1) {
        employees[index] = updatedEmployee;
        localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
    }
}

export function deleteEmployee(employeeId) {
    const employees = getAllEmployees();
    const filteredEmployees = employees.filter(emp => emp.id !== employeeId);
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(filteredEmployees));
}
