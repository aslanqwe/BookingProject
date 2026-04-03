import { useEffect, useState } from 'react';
import axios from 'axios';

interface Booking {
    id: number;
    hotelName: string;
    city: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    createdAt: string;
}

export default function MyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/bookings/my')
            .then(res => setBookings(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const nights = (checkIn: string, checkOut: string) => {
        return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Мои бронирования</h2>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <p className="text-5xl mb-4">🏨</p>
                    <p className="text-gray-500 text-lg">У вас пока нет броней</p>
                    <p className="text-gray-400 text-sm mt-1">Найдите отель и забронируйте его</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {bookings.map(b => (
                        <div key={b.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-[#003580] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">{b.hotelName}</span>
                                <span className="text-blue-200 text-sm">📍 {b.city}</span>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Заезд</p>
                                        <p className="font-semibold text-gray-800">{formatDate(b.checkIn)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Выезд</p>
                                        <p className="font-semibold text-gray-800">{formatDate(b.checkOut)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Гостей</p>
                                        <p className="font-semibold text-gray-800">{b.guests} чел.</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-t pt-4">
                                    <p className="text-sm text-gray-400">
                                        {nights(b.checkIn, b.checkOut)} ноч. · Оформлено {formatDate(b.createdAt)}
                                    </p>
                                    <p className="text-xl font-bold text-[#003580]">{b.totalPrice.toLocaleString()} ₸</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}