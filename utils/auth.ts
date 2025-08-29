import { api } from '../apiClient';

export interface User {
    id: string;
    username: string;
}

interface AuthResponse {
    user: User;
    message: string;
}

const SESSION_KEY = 'currentUser';

export const login = async (username: string, password_raw: string): Promise<{ success: boolean, user: User | null, message: string }> => {
    try {
        const response = await api.post<AuthResponse>('/auth/login', { username, password: password_raw });
        if (response.user) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(response.user));
            window.dispatchEvent(new CustomEvent('auth-change'));
            return { success: true, user: response.user, message: response.message };
        }
        return { success: false, user: null, message: 'Login failed.' };
    } catch (error: any) {
         return { success: false, user: null, message: error.message };
    }
};

export const logout = (): void => {
    sessionStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('auth-change'));
};

export const getCurrentUser = (): User | null => {
    try {
        const user = sessionStorage.getItem(SESSION_KEY);
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
};