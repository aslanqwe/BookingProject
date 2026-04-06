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
    status: string;
    createdAt: string;
}

export default function OwnerDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/bookings/owner')
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

    // Группируем брони по отелям
    const groupedByHotel = bookings.reduce((acc, b) => {
        if (!acc[b.hotelName]) acc[b.hotelName] = [];
        acc[b.hotelName].push(b);
        return acc;
    }, {} as Record<string, Booking[]>);

    const totalRevenue = bookings
        .filter(b => b.status === 'Active')
        .reduce((sum, b) => sum + b.totalPrice, 0);

    const activeBookings = bookings.filter(b => b.status === 'Active').length;

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Панель владельца</h2>

            {/* Статистика */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
                    <p className="text-3xl font-bold text-[#003580]">{Object.keys(groupedByHotel).length}</p>
                    <p className="text-sm text-gray-500 mt-1">Отелей</p>
                </div>
                <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
                    <p className="text-3xl font-bold text-green-600">{activeBookings}</p>
                    <p className="text-sm text-gray-500 mt-1">Активных броней</p>
                </div>
                <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
                    <p className="text-3xl font-bold text-[#003580]">{totalRevenue.toLocaleString()} ₸</p>
                    <p className="text-sm text-gray-500 mt-1">Общий доход</p>
                </div>
            </div>

            {/* Брони по отелям */}
            {Object.keys(groupedByHotel).length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <p className="text-5xl mb-4">🏨</p>
                    <p className="text-gray-500 text-lg">Пока нет броней на ваши отели</p>
                    <p className="text-gray-400 text-sm mt-1">Добавьте отели чтобы начать принимать гостей</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {Object.entries(groupedByHotel).map(([hotelName, hotelBookings]) => {
                        const hotelRevenue = hotelBookings
                            .filter(b => b.status === 'Active')
                            .reduce((sum, b) => sum + b.totalPrice, 0);

                        return (
                            <div key={hotelName} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                {/* Заголовок отеля */}
                                <div className="bg-[#003580] px-6 py-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{hotelName}</h3>
                                        <p className="text-blue-200 text-sm">📍 {hotelBookings[0].city}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{hotelRevenue.toLocaleString()} ₸</p>
                                        <p className="text-blue-200 text-xs">доход от активных броней</p>
                                    </div>
                                </div>

                                {/* Список броней */}
                                <div className="divide-y">
                                    {hotelBookings.map(b => (
                                        <div key={b.id} className={`px-6 py-4 flex justify-between items-center ${b.status === 'Cancelled' ? 'opacity-50' : ''}`}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {b.status === 'Active' ? 'Активна' : 'Отменена'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        Оформлено {formatDate(b.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">
                                                    {formatDate(b.checkIn)} — {formatDate(b.checkOut)}
                                                    <span className="text-gray-400 ml-2">· {nights(b.checkIn, b.checkOut)} ноч. · {b.guests} гост.</span>
                                                </p>
                                            </div>
                                            <p className="font-bold text-gray-800">{b.totalPrice.toLocaleString()} ₸</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}