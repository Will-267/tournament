import { getUsers, saveUsers } from './storage';

export interface User {
    id: string;
    username: string;
    password?: string; // Only used for creation, not stored in session
}

const SESSION_KEY = 'currentUser';

export const signUp = (username: string, password_raw: string): { success: boolean, message: string } => {
    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already exists.' };
    }
    // In a real app, hash the password. Here we simulate.
    const newUser = { id: `u${Date.now()}`, username, password: password_raw };
    saveUsers([...users, newUser]);
    return { success: true, message: 'Sign up successful! Please log in.' };
};

export const login = (username: string, password_raw: string): { success: boolean, user: User | null, message: string } => {
    const users = getUsers();
    // This is NOT secure. For simulation purposes only.
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && (u as any).password === password_raw);

    if (user) {
        const sessionUser: User = { id: user.id, username: user.username };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        window.dispatchEvent(new CustomEvent('auth-change'));
        return { success: true, user: sessionUser, message: 'Login successful' };
    }
    return { success: false, user: null, message: 'Invalid username or password.' };
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