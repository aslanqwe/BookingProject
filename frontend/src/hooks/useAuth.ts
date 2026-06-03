import { useState, useEffect } from 'react';
import { authApi } from '../api/auth';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const checkAuth = async () => {
        try {
            const userData = await authApi.getMe();
            setUser(userData);
        } catch (err) {
            setUser(null); // Если ошибка (например, нет куки), то юзер не авторизован
        } finally {
            setLoadingAuth(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
        } catch (err) {
            console.error('Ошибка при выходе');
        }
    };

    return { user, setUser, loadingAuth, checkAuth, logout };
}