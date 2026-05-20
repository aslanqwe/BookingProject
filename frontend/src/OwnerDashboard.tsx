import { useEffect, useState } from 'react';
import axios from 'axios';
import EditHotelModal from './EditHotelModal';
import ManageRoomTypes from './ManageRoomTypes';

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
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    specialRequests?: string;
    roomTypeName?: string; // Добавлено, чтобы TypeScript не выдавал ошибку
    rooms?: number;        // Добавлено, чтобы TypeScript не выдавал ошибку
}

interface Hotel {
    id: number;
    name: string;
    city: string;
    pricePerNight: number;
    description?: string;
    stars: number;
    totalRooms: number;
    imageUrl?: string;
}

export default function OwnerDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [myHotels, setMyHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [managingRoomsHotel, setManagingRoomsHotel] = useState<Hotel | null>(null);

    const fetchData = () => {
        Promise.all([
            axios.get('/api/bookings/owner'),
            axios.get('/api/hotels/my')
        ])
            .then(([bookingsRes, hotelsRes]) => {
                setBookings(bookingsRes.data);
                setMyHotels(hotelsRes.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const nights = (checkIn: string, checkOut: string) => {
        return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    };

    const groupedByHotel = bookings.reduce((acc, b) => {
        if (!acc[b.hotelName]) acc[b.hotelName] = [];
        acc[b.hotelName].push(b);
        return acc;
    }, {} as Record<string, Booking[]>);

    const totalRevenue = bookings
        .filter(b => b.status === 'Active' || b.status === 'Completed')
        .reduce((sum, b) => sum + b.totalPrice, 0);

    const activeBookings = bookings.filter(b => b.status === 'Active').length;

    const handleDelete = async (hotelId: number, hotelName: string) => {
        if (!confirm(`Удалить "${hotelName}"? Все брони сохранятся в истории.`)) return;
        try {
            await axios.delete(`/api/hotels/${hotelId}`);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Ошибка при удалении');
        }
    };

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
                    <p className="text-3xl font-bold text-[#003580]">{myHotels.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Отелей</p>
                </div>
                <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
                    <p className="text-3xl font-bold text-green-600">{activeBookings}</p>
                    <p className="text-sm text-gray-500 mt-1">Активных броней</p>
                </div>
                <div className="bg-white rounded-xl border shadow-sm p-5 text-center">
                    <p className="text-2xl font-bold text-[#003580]">{totalRevenue.toLocaleString()} ₸</p>
                    <p className="text-sm text-gray-500 mt-1">Общий доход</p>
                </div>
            </div>

            {/* Мои отели */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Мои отели</h3>
            <div className="flex flex-col gap-3 mb-8">
                {myHotels.map(hotel => (
                    <div key={hotel.id} className="bg-white rounded-xl border shadow-sm flex overflow-hidden">
                        <div className="w-32 shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                            {hotel.imageUrl ? (
                                <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-blue-300 font-bold text-sm text-center px-2">{hotel.name}</span>
                            )}
                        </div>
                        <div className="flex-1 p-4 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-800">{hotel.name}</h4>
                                <p className="text-sm text-gray-500">📍 {hotel.city}</p>
                                <p className="text-yellow-400 text-sm">{'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}</p>
                                <p className="text-sm text-gray-600">{hotel.pricePerNight.toLocaleString()} ₸/ночь · {hotel.totalRooms} номеров</p>
                            </div>

                            {/* Блок кнопок */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setManagingRoomsHotel(hotel)}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition"
                                >
                                    🛏 Номера
                                </button>
                                <button
                                    onClick={() => setEditingHotel(hotel)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
                                >
                                    ✏️ Изменить
                                </button>
                                <button
                                    onClick={() => handleDelete(hotel.id, hotel.name)}
                                    className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition"
                                >
                                    🗑 Удалить
                                </button>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {/* Брони по отелям */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Бронирования</h3>
            {Object.keys(groupedByHotel).length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <p className="text-5xl mb-4">🏨</p>
                    <p className="text-gray-500 text-lg">Пока нет броней на ваши отели</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {Object.entries(groupedByHotel).map(([hotelName, hotelBookings]) => {
                        const hotelRevenue = hotelBookings
                            .filter(b => b.status === 'Active' || b.status === 'Completed')
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
                                <div className="divide-y">
                                    {hotelBookings.map(b => (
                                        // ВОТ ЭТОТ БЛОК БЫЛ ЗАМЕНЕН НА НОВЫЙ ВАРИАНТ С ДАННЫМИ ГОСТЯ:
                                        <div key={b.id} className={`px-6 py-4 ${b.status === 'Cancelled' ? 'opacity-50' : ''}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                            b.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                                b.status === 'Completed' ? 'bg-gray-100 text-gray-500' :
                                                                    'bg-red-100 text-red-500'
                                                        }`}>
                                                            {b.status === 'Active' ? 'Активна' : b.status === 'Completed' ? 'Завершена' : 'Отменена'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">Оформлено {formatDate(b.createdAt)}</span>
                                                    </div>

                                                    {/* Даты */}
                                                    <p className="text-sm font-medium text-gray-700">
                                                        📅 {formatDate(b.checkIn)} — {formatDate(b.checkOut)}
                                                        <span className="text-gray-400 ml-2">· {nights(b.checkIn, b.checkOut)} ноч.</span>
                                                    </p>

                                                    {/* Тип номера */}
                                                    {b.roomTypeName && (
                                                        <p className="text-sm text-gray-600 mt-1">🛏 {b.roomTypeName} · {b.rooms} ном.</p>
                                                    )}

                                                    {/* Данные гостя */}
                                                    <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm">
                                                        <p className="font-bold text-gray-700 mb-1">👤 Гость:</p>
                                                        {b.guestName && <p className="text-gray-600">Имя: <span className="font-medium">{b.guestName}</span></p>}
                                                        {b.guestPhone && <p className="text-gray-600">Тел: <a href={"tel:" + b.guestPhone} className="text-blue-600 font-medium">{b.guestPhone}</a></p>}
                                                        {b.guestEmail && <p className="text-gray-600">Email: <span className="text-blue-600">{b.guestEmail}</span></p>}
                                                        <p className="text-gray-600">Гостей: <span className="font-medium">{b.guests} чел.</span></p>
                                                        {b.specialRequests && (
                                                            <p className="text-gray-600 mt-1">💬 Пожелания: <span className="italic">{b.specialRequests}</span></p>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="font-bold text-gray-800 text-lg ml-4">{b.totalPrice.toLocaleString()} ₸</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Модальное окно редактирования */}
            <EditHotelModal
                hotel={editingHotel}
                onClose={() => setEditingHotel(null)}
                onSuccess={() => {
                    fetchData();
                    setEditingHotel(null);
                }}
            />

            {/* Модальное окно управления номерами */}
            {managingRoomsHotel && (
                <ManageRoomTypes
                    hotelId={managingRoomsHotel.id}
                    hotelName={managingRoomsHotel.name}
                    onClose={() => setManagingRoomsHotel(null)}
                />
            )}

        </div>
    );
}