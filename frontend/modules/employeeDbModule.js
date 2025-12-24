// employeeDbModule.js - CRUD nhân viên
const API = 'http://localhost/_HRM1/backend/api.php';

class EmployeeDbModule {
    async getAllEmployees() {
        const response = await fetch(`${API}?resource=employees`);
        return response.json();
    }

    async getEmployeeById(id) {
        const response = await fetch(`${API}?resource=employees&id=${id}`);
        return response.json();
    }

    async createEmployee(data) {
        const response = await fetch(`${API}?resource=employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    async updateEmployee(id, data) {
        const response = await fetch(`${API}?resource=employees&id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    async deleteEmployee(id) {
        const response = await fetch(`${API}?resource=employees&id=${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }

    async searchEmployees(filters) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API}?resource=search-employees&${params}`);
        return response.json();
    }
}

export default new EmployeeDbModule();
