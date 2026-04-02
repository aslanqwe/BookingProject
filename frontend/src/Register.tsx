import { useState } from 'react';
import axios from 'axios';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'User' // По умолчанию обычный юзер
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Отправляем данные на твой бэкенд
            await axios.post('/api/auth/register', formData);
            setMessage('Регистрация успешна! Теперь вы можете войти.');
        } catch (error: any) {
            setMessage('Ошибка: ' + (error.response?.data?.[0]?.description || 'Что-то пошло не так'));
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md border w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Создать аккаунт</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Электронная почта</label>
                        <input
                            type="email"
                            className="mt-1 block w-full border rounded-md p-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Пароль</label>
                        <input
                            type="password"
                            className="mt-1 block w-full border rounded-md p-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Кто вы?</label>
                        <select
                            className="mt-1 block w-full border rounded-md p-2 border-gray-300 bg-white"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="User">Я хочу бронировать отели (Клиент)</option>
                            <option value="Owner">Я сдаю своё жилье (Владелец)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition-colors"
                    >
                        Зарегистрироваться
                    </button>
                </form>

                {message && <p className="mt-4 text-center text-sm font-medium text-blue-600">{message}</p>}
            </div>
        </div>
    );
}