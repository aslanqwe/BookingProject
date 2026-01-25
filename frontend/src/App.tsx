import { useEffect, useState } from 'react'
import axios from 'axios'
import './index.css'
import Register from './Register'
import Login from './Login' 
import AddHotel from './AddHotel'

interface Hotel {
    id: number;
    name: string;
    city: string;
    pricePerNight: number;
}

interface User {
    email: string;
    role: string;
}

function App() {
    const [hotels, setHotels] = useState<Hotel[]>([])
    // 'list' | 'register' | 'login' — управляем тем, что видит пользователь
    const [view, setView] = useState<'list' | 'register' | 'login' | 'add-hotel'>('list')
    // Храним данные вошедшего пользователя
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        // Проверяем, не входил ли пользователь ранее (сохранено в браузере)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        axios.get('https://localhost:7200/api/hotels')
            .then(res => setHotels(res.data))
            .catch(err => console.error(err))
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setView('list');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-[#003580] p-4 text-white shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setView('list')}>
                        Booking.kz
                    </h1>

                    <div className="space-x-4 flex items-center">
                        {!user ? (
                            <>
                                <button onClick={() => setView('login')} className="hover:underline font-semibold text-sm">Войти</button>
                                <button
                                    onClick={() => setView('register')}
                                    className="bg-white text-[#003580] px-4 py-1 rounded font-semibold text-sm hover:bg-gray-100"
                                >
                                    Зарегистрироваться
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-sm border-r pr-4 border-blue-400">
                                    {user.email} <strong className="ml-1">({user.role})</strong>
                                </span>
                                {user.role === 'Owner' && (
                                    <button
                                        onClick={() => setView('add-hotel')} // При нажатии открываем форму
                                        className="bg-green-600 px-3 py-1 rounded text-sm font-bold hover:bg-green-700"
                                    >
                                        + Добавить отель
                                    </button>
                                )}
                                <button onClick={handleLogout} className="text-sm opacity-80 hover:opacity-100 italic">Выйти</button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="container mx-auto py-8 px-4">
                {/* Условный рендеринг в зависимости от view */}
                {view === 'register' && <Register />}

                {view === 'login' && (
                    <Login onLoginSuccess={(userData) => {
                        setUser(userData);
                        setView('list'); // После входа возвращаемся к списку
                    }} />
                )}

                {view === 'list' && (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-sans">Популярные направления в Казахстане</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hotels.map(h => (
                                <div key={h.id} className="bg-white rounded-lg overflow-hidden shadow-sm border p-4 hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-bold text-blue-600">{h.name}</h3>
                                    <p className="text-sm text-gray-500 underline">{h.city}</p>
                                    <div className="mt-4 flex justify-between items-end">
                                        <p className="text-xl font-bold text-gray-900">{h.pricePerNight.toLocaleString()} ₸</p>
                                        <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Смотреть</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {view === 'add-hotel' && user && (
                    <AddHotel
                        ownerEmail={user.email}
                        onSuccess={() => setView('list')}
                    />
                )}
            </main>
        </div>
    )
}

export default App