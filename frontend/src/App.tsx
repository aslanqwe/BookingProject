import { useEffect, useState } from 'react'
import axios from 'axios'
import './index.css'
import Register from './Register'
import Login from './Login'
import AddHotel from './AddHotel'
import HotelModal from './HotelModal';

axios.defaults.withCredentials = true;

interface Hotel {
    id: number;
    name: string;
    city: string;
    pricePerNight: number;
    description?: string;
}

interface User {
    email: string;
    role: string;
}

function App() {
    const [hotels, setHotels] = useState<Hotel[]>([])
    const [view, setView] = useState<'list' | 'register' | 'login' | 'add-hotel'>('list')
    const [user, setUser] = useState<User | null>(null)
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null); // Уточнил тип для Hotel
    const [loading, setLoading] = useState(true);
    
    const fetchHotels = () => {
        axios.get('/api/hotels')
            .then(res => setHotels(res.data))
            .catch(err => console.error("Ошибка загрузки отелей:", err))
    }

    useEffect(() => {
        axios.get('/api/auth/me')
            .then(res => {
                console.log('me ответил:', res.data);
                const userData = { email: res.data.email, role: res.data.role };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            })
            .catch((err) => {
                console.log('me ошибка:', err.response?.status, err.response?.data);
                localStorage.removeItem('user');
                setUser(null);
            }) 
            .finally(() => setLoading(false));
        fetchHotels();
    }, [])

    const handleLogout = async () => {
        await axios.post('/api/auth/logout');
        localStorage.removeItem('user');
        setUser(null);
        setView('list');
    };
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Загрузка...</p>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
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
                                        onClick={() => setView('add-hotel')}
                                        className="bg-green-600 px-3 py-1 rounded text-sm font-bold hover:bg-green-700 transition-colors"
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
                {view === 'register' && <Register />}

                {view === 'login' && (
                    <Login onLoginSuccess={(userData) => {
                        setUser(userData);
                        fetchHotels();
                        setView('list');
                    }} />
                )}

                {view === 'list' && (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Популярные направления в Казахстане</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hotels.map(h => (
                                <div key={h.id} className="bg-white rounded-lg overflow-hidden shadow-sm border p-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-blue-600">{h.name}</h3>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{h.city}</p>
                                        <p className="text-sm text-gray-600 italic line-clamp-3 mb-4">
                                            {h.description && h.description.trim() !== ""
                                                ? h.description
                                                : "Описание отсутствует"}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-end border-t pt-4">
                                        <p className="text-xl font-bold text-gray-900">{h.pricePerNight.toLocaleString()} ₸</p>
                                        {/* ДобавилsetSelectedHotel(h) сюда */}
                                        <button
                                            onClick={() => setSelectedHotel(h)}
                                            className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                            Смотреть
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {view === 'add-hotel' && user && (
                    <AddHotel
                        ownerEmail={user.email}
                        onSuccess={() => {
                            fetchHotels();
                            setView('list');
                        }}
                    />
                )}
            </main>

            {/* Всплывающее окно отеля */}
            <HotelModal
                hotel={selectedHotel}
                onClose={() => setSelectedHotel(null)}
            />
        </div>
    )
}

export default App;