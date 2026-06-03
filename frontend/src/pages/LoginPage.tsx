import { useState } from 'react';
import { authApi } from '../api/auth';
import type { User } from '../types';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginProps) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await authApi.login(formData);
            onLoginSuccess({ email: data.email, role: data.role });
        } catch {
            setError('Неверный логин или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-lg shadow-lg border w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Вход на Booking.kz</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="example@mail.com"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#003580] text-white py-2 rounded font-bold hover:bg-[#002b66] transition disabled:opacity-50"
                    >
                        {loading ? 'Входим...' : 'Войти'}
                    </button>
                </form>
                {error && (
                    <div className="mt-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}