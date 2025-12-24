// authModule.js - Xác thực người dùng
const API = 'http://localhost/_HRM1/backend/api.php';

class AuthModule {
    constructor() {
        this.currentUser = this.checkSession();
    }

    checkSession() {
        const session = localStorage.getItem('session');
        return session ? JSON.parse(session) : null;
    }

    async register(username, password, passwordConfirm) {
        if (!username || !password || !passwordConfirm) {
            return { error: 'Tất cả trường bắt buộc' };
        }
        if (password !== passwordConfirm) {
            return { error: 'Password không khớp' };
        }

        const response = await fetch(`${API}?resource=auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', username, password, password_confirm: passwordConfirm })
        });
        return response.json();
    }

    async login(username, password) {
        if (!username || !password) {
            return { error: 'Username và password bắt buộc' };
        }

        const response = await fetch(`${API}?resource=auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password })
        });

        const result = await response.json();
        if (result.success) {
            const session = { token: result.token, user: result.user, expiry: Date.now() + 86400000 };
            localStorage.setItem('session', JSON.stringify(session));
            this.currentUser = session;
        }
        return result;
    }

    logout() {
        localStorage.removeItem('session');
        this.currentUser = null;
        return { success: true };
    }

    isAuthenticated() {
        return this.currentUser && this.currentUser.expiry > Date.now();
    }

    getUser() {
        return this.currentUser?.user || null;
    }
}

export default new AuthModule();
