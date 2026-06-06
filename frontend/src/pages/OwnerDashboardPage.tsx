import { useEffect, useState } from 'react';
import EditHotelModal from '../components/EditHotelModal';
import ManageRoomTypes from '../components/ManageRoomTypes';
import { useOwnerData } from '../hooks/useOwnerData';

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
    roomTypeName?: string;
    rooms?: number;
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
    images?: string[];
    propertyType: string;
    hotelAmenities?: string;
}

export default function OwnerDashboard() {
    const { bookings, myHotels, loading, fetchData, deleteHotel } = useOwnerData();

    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [managingRoomsHotel, setManagingRoomsHotel] = useState<Hotel | null>(null);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Панель владельца</h2>

            {/* Статистика (На мобильных 1 колонка, на ПК - 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
            <div className="flex flex-col gap-4 mb-8">
                {myHotels.map(hotel => {
                    const rawUrl = hotel.imageUrl || (hotel.images ? hotel.images.join(',') : '');
                    const imgArray = rawUrl ? rawUrl.split(',').map(u => u.trim()).filter(Boolean) : [];
                    const coverImage = imgArray.length > 0 ? imgArray[imgArray.length - 1] : null;

                    return (
                        <div key={hotel.id} className="bg-white rounded-xl border shadow-sm flex flex-col md:flex-row overflow-hidden">
                            {/* Фото (На мобильных на всю ширину) */}
                            <div className="w-full h-48 md:w-40 md:h-auto shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                                {coverImage ? (
                                    <img src={coverImage} alt={hotel.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-blue-300 font-bold text-sm text-center px-2">{hotel.name}</span>
                                )}
                            </div>

                            {/* Контент и кнопки */}
                            <div className="flex-1 p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="w-full">
                                    <h4 className="font-bold text-gray-800 text-lg">{hotel.name}</h4>
                                    <p className="text-sm text-gray-500 mt-1">📍 {hotel.city}</p>
                                    <p className="text-yellow-400 text-sm mt-1">{'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}</p>
                                    <p className="text-sm text-gray-600 mt-1">{hotel.pricePerNight.toLocaleString()} ₸/ночь · {hotel.totalRooms} номеров</p>
                                </div>

                                {/* Блок кнопок (На мобилках сетка или колонка) */}
                                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                                    <button onClick={() => setManagingRoomsHotel(hotel)} className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition text-center whitespace-nowrap">
                                        🛏 Номера
                                    </button>
                                    <button onClick={() => setEditingHotel(hotel)} className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition text-center whitespace-nowrap">
                                        ✏️ Изменить
                                    </button>
                                    <button onClick={() => deleteHotel(hotel.id, hotel.name)} className="flex-1 lg:flex-none px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition text-center whitespace-nowrap">
                                        🗑 Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
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
                                <div className="bg-[#003580] px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{hotelName}</h3>
                                        <p className="text-blue-200 text-sm">📍 {hotelBookings[0].city}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-white font-bold">{hotelRevenue.toLocaleString()} ₸</p>
                                        <p className="text-blue-200 text-xs">доход от активных броней</p>
                                    </div>
                                </div>
                                <div className="divide-y">
                                    {hotelBookings.map(b => (
                                        <div key={b.id} className={`px-4 sm:px-6 py-4 ${b.status === 'Cancelled' ? 'opacity-50' : ''}`}>
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                <div className="flex-1 w-full">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.status === 'Active' ? 'bg-green-100 text-green-700' : b.status === 'Completed' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-500'}`}>
                                                            {b.status === 'Active' ? 'Активна' : b.status === 'Completed' ? 'Завершена' : 'Отменена'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">Оформлено {formatDate(b.createdAt)}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        📅 {formatDate(b.checkIn)} — {formatDate(b.checkOut)}
                                                        <span className="text-gray-400 ml-2">· {nights(b.checkIn, b.checkOut)} ноч.</span>
                                                    </p>
                                                    {b.roomTypeName && <p className="text-sm text-gray-600 mt-1">🛏 {b.roomTypeName} · {b.rooms} ном.</p>}
                                                    <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm">
                                                        <p className="font-bold text-gray-700 mb-1">👤 Гость:</p>
                                                        {b.guestName && <p className="text-gray-600">Имя: <span className="font-medium">{b.guestName}</span></p>}
                                                        {b.guestPhone && <p className="text-gray-600">Тел: <a href={"tel:" + b.guestPhone} className="text-blue-600 font-medium">{b.guestPhone}</a></p>}
                                                        {b.guestEmail && <p className="text-gray-600">Email: <span className="text-blue-600">{b.guestEmail}</span></p>}
                                                        <p className="text-gray-600">Гостей: <span className="font-medium">{b.guests} чел.</span></p>
                                                        {b.specialRequests && <p className="text-gray-600 mt-1">💬 Пожелания: <span className="italic">{b.specialRequests}</span></p>}
                                                    </div>
                                                </div>
                                                <p className="font-bold text-gray-800 text-xl sm:text-lg">{b.totalPrice.toLocaleString()} ₸</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Модалки */}
            <EditHotelModal hotel={editingHotel} onClose={() => setEditingHotel(null)} onSuccess={() => { fetchData(); setEditingHotel(null); }} />
            {managingRoomsHotel && <ManageRoomTypes hotelId={managingRoomsHotel.id} hotelName={managingRoomsHotel.name} onClose={() => setManagingRoomsHotel(null)} />}
        </div>
    );
}