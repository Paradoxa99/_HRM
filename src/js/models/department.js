const DEPARTMENT_KEY = 'departments';

// Simple Department class so controllers can `new Department({...})`
export class Department {
    constructor({ id, name, managerId } = {}) {
        this.id = id || Date.now().toString();
        this.name = name || '';
        this.managerId = managerId || null;
    }
}

export function getAllDepartments() {
    const departments = JSON.parse(localStorage.getItem(DEPARTMENT_KEY)) || [];
    return departments;
}

export function addDepartment(department) {
    const departments = getAllDepartments();
    departments.push(department);
    localStorage.setItem(DEPARTMENT_KEY, JSON.stringify(departments));
}

export function deleteDepartment(departmentId) {
    let departments = getAllDepartments();
    departments = departments.filter(department => department.id !== departmentId);
    localStorage.setItem(DEPARTMENT_KEY, JSON.stringify(departments));
}
