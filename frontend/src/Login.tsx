import { useState } from 'react';
import axios from 'axios';

interface LoginProps {
    onLoginSuccess: (user: { email: string; role: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Сбрасываем ошибку перед новой попыткой

        try {
            const response = await axios.post('https://localhost:7200/api/auth/login', formData);

            // Сохраняем объект пользователя для App.tsx (email и роль)
            localStorage.setItem('user', JSON.stringify({
                email: response.data.email,
                role: response.data.role
            }));

            // Этот 'token' будет искать AddHotel.tsx
            localStorage.setItem('token', response.data.token);

            // Сообщаем главному компоненту, что вход выполнен успешно
            onLoginSuccess(response.data);

        } catch (err: any) {
            console.error('Ошибка входа:', err);
            setError('Неверный логин или пароль');
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
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#003580] text-white py-2 rounded font-bold hover:bg-[#002b66] transition-colors">
                        Войти
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