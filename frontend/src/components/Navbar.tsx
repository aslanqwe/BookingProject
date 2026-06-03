import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

interface NavbarProps {
    user: User | null;
    onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const go = (path: string) => {
        navigate(path);
        setMenuOpen(false);
    };

    return (
        <nav className="bg-[#003580] text-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Логотип */}
                    <h1 className="text-2xl font-bold cursor-pointer tracking-tight" onClick={() => go('/')}>
                        Booking.kz
                    </h1>

                    {/* Десктоп меню */}
                    <div className="hidden md:flex items-center gap-3">
                        {!user ? (
                            <>
                                <button onClick={() => go('/login')} className="text-sm font-medium px-4 py-2 rounded border border-white/40 hover:bg-white/10 transition">Войти</button>
                                <button onClick={() => go('/register')} className="text-sm font-bold px-4 py-2 rounded bg-white text-[#003580] hover:bg-gray-100 transition">Зарегистрироваться</button>
                            </>
                        ) : (
                            <>
                                <span className="text-sm text-blue-200 hidden lg:block">
                                    {user.email} <strong className="text-white">({user.role})</strong>
                                </span>
                                <button onClick={() => go('/my-bookings')} className="text-sm font-medium px-4 py-2 rounded border border-white/40 hover:bg-white/10 transition">Мои брони</button>
                                {user.role === 'Owner' && (
                                    <>
                                        <button onClick={() => go('/owner-dashboard')} className="text-sm font-medium px-4 py-2 rounded border border-white/40 hover:bg-white/10 transition">Мои отели</button>
                                        <button onClick={() => go('/add-hotel')} className="text-sm font-bold px-4 py-2 rounded bg-green-500 hover:bg-green-600 transition">+ Добавить</button>
                                    </>
                                )}
                                <button onClick={() => { onLogout(); setMenuOpen(false); }} className="text-sm px-4 py-2 rounded border border-white/40 hover:bg-white/10 transition">Выйти</button>
                            </>
                        )}
                    </div>

                    {/* Бургер */}
                    <button className="md:hidden p-2 rounded hover:bg-white/10 transition" onClick={() => setMenuOpen(prev => !prev)}>
                        {menuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Мобильное меню */}
                {menuOpen && (
                    <div className="md:hidden pb-4 border-t border-white/20 mt-1 pt-3 flex flex-col gap-2">
                        {!user ? (
                            <>
                                <button onClick={() => go('/login')} className="text-sm font-medium px-4 py-3 rounded border border-white/40 hover:bg-white/10 transition text-left">Войти</button>
                                <button onClick={() => go('/register')} className="text-sm font-bold px-4 py-3 rounded bg-white text-[#003580] hover:bg-gray-100 transition text-left">Зарегистрироваться</button>
                            </>
                        ) : (
                            <>
                                <p className="text-xs text-blue-200 px-1">{user.email} · {user.role}</p>
                                <button onClick={() => go('/my-bookings')} className="text-sm font-medium px-4 py-3 rounded border border-white/40 hover:bg-white/10 transition text-left">📋 Мои брони</button>
                                {user.role === 'Owner' && (
                                    <>
                                        <button onClick={() => go('/owner-dashboard')} className="text-sm font-medium px-4 py-3 rounded border border-white/40 hover:bg-white/10 transition text-left">🏨 Мои отели</button>
                                        <button onClick={() => go('/add-hotel')} className="text-sm font-bold px-4 py-3 rounded bg-green-500 hover:bg-green-600 transition text-left">+ Добавить объект</button>
                                    </>
                                )}
                                <button onClick={() => { onLogout(); setMenuOpen(false); }} className="text-sm px-4 py-3 rounded border border-white/40 hover:bg-white/10 transition text-left">Выйти</button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}