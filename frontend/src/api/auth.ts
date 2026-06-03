import axios from 'axios';
import type { User } from '../types';

axios.defaults.withCredentials = true;

interface LoginCredentials { email: string; password: string; }
interface RegisterData { email: string; password: string; role: string; phone?: string; }

export const authApi = {
    getMe: async (): Promise<User> => {
        const res = await axios.get('/api/auth/me');
        return res.data;
    },
    logout: async (): Promise<void> => {
        await axios.post('/api/auth/logout');
    },
    login: async (credentials: LoginCredentials): Promise<User & { role: string }> => {
        const res = await axios.post('/api/auth/login', credentials);
        return res.data;
    },
    register: async (data: RegisterData): Promise<{ message: string }> => {
        const res = await axios.post('/api/auth/register', data);
        return res.data;
    },
};