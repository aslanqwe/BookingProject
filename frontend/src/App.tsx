import { useEffect, useState } from 'react'
import axios from 'axios'
import './index.css'
import Register from './Register'
import Login from './Login'
import AddHotel from './AddHotel'
import HotelModal from './HotelModal';
import MyBookings from './MyBookings';

axios.defaults.withCredentials = true;

interface Hotel {
    id: number;
    name: string;
    city: string;
    pricePerNight: number;
    description?: string;
    stars: number;
    totalRooms: number;
}

interface User {
    email: string;
    role: string;
}

function App() {
    const [hotels, setHotels] = useState<Hotel[]>([])
    const [view, setView] = useState<'list' | 'register' | 'login' | 'add-hotel' | 'my-bookings'>('list')
    const [user, setUser] = useState<User | null>(null)
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
    const [loading, setLoading] = useState(true)

    const [searchCity, setSearchCity] = useState('')
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [guests, setGuests] = useState(2)
    const [maxPrice, setMaxPrice] = useState(500000)
    const [filterStars, setFilterStars] = useState(0)
    const [priceTimer, setPriceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

    const fetchHotels = (city = '', price = 500000, stars = 0) => {
        axios.get('/api/hotels', {
            params: {
                city: city.trim() || undefined,
                maxPrice: price < 500000 ? price : undefined,
                stars: stars > 0 ? stars : undefined
            }
        })
            .then(res => setHotels(res.data))
            .catch(err => console.error("Ошибка загрузки отелей:", err))
    }

    useEffect(() => {
        axios.get('/api/auth/me')
            .then(res => {
                const userData = { email: res.data.email, role: res.data.role };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            })
            .catch(() => {
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

    const handleReset = () => {
        setSearchCity('');
        setMaxPrice(500000);
        setCheckIn('');
        setCheckOut('');
        setGuests(2);
        setFilterStars(0);
        fetchHotels('', 500000, 0);
    };

    const handleStarsFilter = (stars: number) => {
        const newStars = filterStars === stars ? 0 : stars;
        setFilterStars(newStars);
        fetchHotels(searchCity, maxPrice, newStars);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-lg">Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ШАПКА */}
            <nav className="bg-[#003580] text-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <h1
                            className="text-2xl font-bold cursor-pointer tracking-tight"
                            onClick={() => { setView('list'); fetchHotels(); }}
                        >
                            Booking.kz
                        </h1>
                        <div className="flex items-center gap-3">
                            {!user ? (
                                <>
                                    <button
                                        onClick={() => setView('login')}
                                        className="text-sm font-medium px-4 py-2 rounded border border-white/40 hover:bg-white/10 transition"
                                    >
                                        Войти
                                    </button>
                                    <button
                                        onClick={() => setView('register')}
                                        className="text-sm font-bold px-4 py-2 rounded bg-white text-[#003580] hover:bg-gray-100 transition"
                                    >
                                        Зарегистрироваться
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm text-blue-200 hidden md:block">
                                        {user.email} <strong className="text-white">({user.role})</strong>
                                    </span>
                                    {user.role === 'User' && (
                                        <button
                                            onClick={() => setView('my-bookings')}
                                            className="text-sm font-medium px-4 py-2 rounded border border-white/40 hover:bg-white/10 transition"
                                        >
                                            Мои брони
                                        </button>
                                    )}
                                    {user.role === 'Owner' && (
                                        <button
                                            onClick={() => setView('add-hotel')}
                                            className="text-sm font-bold px-4 py-2 rounded bg-green-500 hover:bg-green-600 transition"
                                        >
                                            + Добавить отель
                                        </button>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm px-4 py-2 rounded border border-white/40 hover:bg-white/10 transition"
                                    >
                                        Выйти
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {view === 'register' && (
                <main className="container mx-auto py-8 px-4">
                    <Register />
                </main>
            )}
            {view === 'login' && (
                <main className="container mx-auto py-8 px-4">
                    <Login onLoginSuccess={(userData) => {
                        setUser(userData);
                        fetchHotels();
                        setView('list');
                    }} />
                </main>
            )}
            {view === 'add-hotel' && user && (
                <main className="container mx-auto py-8 px-4">
                    <AddHotel
                        ownerEmail={user.email}
                        onSuccess={() => {
                            fetchHotels();
                            setView('list');
                        }}
                    />
                </main>
            )}
            {view === 'my-bookings' && (
                <main className="container mx-auto py-8 px-4">
                    <MyBookings />
                </main>
            )}

            {view === 'list' && (
                <>
                    {/* ГЕРОБЛОК */}
                    <div className="bg-[#003580] pb-16 pt-8">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl font-bold text-white mb-1">Отели в Казахстане</h2>
                            <p className="text-blue-200 mb-6 text-sm">Найдите идеальное жильё для вашей поездки</p>

                            <div className="bg-[#febb02] p-1 rounded-lg inline-block w-full">
                                <div className="bg-white rounded-md flex flex-col md:flex-row">
                                    <div className="flex items-center gap-2 px-4 py-3 flex-1 border-b md:border-b-0 md:border-r border-gray-200">
                                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Куда вы хотите поехать?"
                                            className="outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                                            value={searchCity}
                                            onChange={e => setSearchCity(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && fetchHotels(searchCity, maxPrice, filterStars)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-400">Заезд</p>
                                            <input type="date" className="outline-none text-sm text-gray-700" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-400">Выезд</p>
                                            <input type="date" className="outline-none text-sm text-gray-700" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-400">Гостей</p>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="w-6 h-6 rounded-full border border-blue-600 text-blue-600 font-bold text-lg flex items-center justify-center hover:bg-blue-50">−</button>
                                                <span className="text-sm font-semibold w-4 text-center">{guests}</span>
                                                <button onClick={() => setGuests(g => g + 1)} className="w-6 h-6 rounded-full border border-blue-600 text-blue-600 font-bold text-lg flex items-center justify-center hover:bg-blue-50">+</button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fetchHotels(searchCity, maxPrice, filterStars)}
                                        className="bg-[#0071c2] hover:bg-[#005999] text-white font-bold px-8 py-3 rounded-r-md transition text-sm whitespace-nowrap"
                                    >
                                        Найти
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* КОНТЕНТ */}
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col lg:flex-row gap-6">

                            {/* ФИЛЬТРЫ */}
                            <aside className="lg:w-64 shrink-0">
                                <div className="bg-white rounded-lg shadow-sm border p-4">
                                    <h3 className="font-bold text-gray-800 mb-4">Фильтры</h3>

                                    {/* Фильтр по цене */}
                                    <div className="mb-5">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">
                                            Цена за ночь до: <span className="text-blue-600">{maxPrice.toLocaleString()} ₸</span>
                                        </p>
                                        <input
                                            type="range"
                                            min={1000}
                                            max={500000}
                                            step={1000}
                                            value={maxPrice}
                                            onChange={e => {
                                                const val = Number(e.target.value);
                                                setMaxPrice(val);
                                                if (priceTimer) clearTimeout(priceTimer);
                                                const timer = setTimeout(() => fetchHotels(searchCity, val, filterStars), 500);
                                                setPriceTimer(timer);
                                            }}
                                            className="w-full accent-blue-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>1 000 ₸</span>
                                            <span>500 000 ₸</span>
                                        </div>
                                    </div>

                                    {/* Фильтр по звёздам */}
                                    <div className="mb-5">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Звёзды</p>
                                        <div className="flex flex-col gap-2">
                                            {[5, 4, 3, 2, 1].map(star => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleStarsFilter(star)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${filterStars === star ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                                >
                                                    <span className="text-yellow-400">{'★'.repeat(star)}{'☆'.repeat(5 - star)}</span>
                                                    <span>{star} звезды</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleReset}
                                        className="w-full text-sm text-blue-600 border border-blue-200 rounded py-2 hover:bg-blue-50 transition"
                                    >
                                        Сбросить фильтры
                                    </button>
                                </div>
                            </aside>

                            {/* СПИСОК ОТЕЛЕЙ */}
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {searchCity ? `Отели в городе "${searchCity}"` : 'Все отели Казахстана'}
                                        <span className="text-sm font-normal text-gray-500 ml-2">{hotels.length} вариантов</span>
                                    </h2>
                                </div>

                                {hotels.length === 0 ? (
                                    <div className="bg-white rounded-lg border p-12 text-center">
                                        <p className="text-gray-400 text-lg">Ничего не найдено</p>
                                        <p className="text-gray-400 text-sm mt-1">Попробуйте изменить фильтры</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {hotels.map(h => (
                                            <div key={h.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow flex overflow-hidden">
                                                <div className="w-48 shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                                    <span className="text-blue-300 font-bold text-lg text-center px-2">{h.name}</span>
                                                </div>
                                                <div className="flex-1 p-4 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-blue-700">{h.name}</h3>
                                                                <p className="text-sm text-gray-500 mt-0.5">📍 {h.city}</p>
                                                                {/* Звёзды */}
                                                                <p className="text-yellow-400 text-sm mt-1">
                                                                    {'★'.repeat(h.stars)}{'☆'.repeat(5 - h.stars)}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                                {h.totalRooms} номеров
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                            {h.description && h.description.trim() !== "" ? h.description : "Описание отсутствует"}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-between items-end mt-4">
                                                        <div>
                                                            {checkIn && checkOut && (
                                                                <p className="text-xs text-gray-400">{checkIn} — {checkOut} · {guests} гост.</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-gray-900">{h.pricePerNight.toLocaleString()} ₸</p>
                                                            <p className="text-xs text-gray-400 mb-2">за ночь</p>
                                                            <button
                                                                onClick={() => setSelectedHotel(h)}
                                                                className="bg-[#0071c2] hover:bg-[#005999] text-white text-sm font-bold px-5 py-2 rounded transition"
                                                            >
                                                                Смотреть
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            <HotelModal
                hotel={selectedHotel}
                onClose={() => setSelectedHotel(null)}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
            />
        </div>
    )
}

export default App