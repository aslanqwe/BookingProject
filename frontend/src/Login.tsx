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
        try {
            // Отправляем запрос на новый метод Login
            const response = await axios.post('https://localhost:7200/api/auth/login', formData);

            // Сохраняем в localStorage, чтобы после перезагрузки сайта не вылетать
            localStorage.setItem('user', JSON.stringify(response.data));

            // Передаем данные пользователя наверх в App.tsx
            onLoginSuccess(response.data);
        } catch (err: any) {
            setError('Неверный логин или пароль');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-lg shadow-lg border w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Вход на Booking.kz</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border p-2 rounded"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        className="w-full border p-2 rounded"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="submit" className="w-full bg-[#003580] text-white py-2 rounded font-bold">
                        Войти
                    </button>
                </form>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
}