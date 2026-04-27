import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface RoomType {
    id: number;
    hotelId: number;
    name: string;
    description?: string;
    pricePerNight: number;
    totalRooms: number;
    maxGuests: number;
    amenities?: string;
    imageUrl?: string;
    availableRooms: number;
}

interface Hotel {
    id: number;
    name: string;
    city: string;
    address?: string;
    pricePerNight: number;
    description?: string;
    stars: number;
    totalRooms: number;
    imageUrl?: string;
    propertyType: string;
}

interface HotelPageProps {
    hotel: Hotel;
    checkIn: string;
    checkOut: string;
    guests: number;
    onBack: () => void;
    onBookingSuccess: () => void;
}

interface BookingState {
    roomTypeId: number | null;
    roomTypeName: string;
    pricePerNight: number;
    rooms: number;
    guests: number;
}

export default function HotelPage({
                                      hotel,
                                      checkIn: initialCheckIn,
                                      checkOut: initialCheckOut,
                                      guests: initialGuests,
                                      onBack,
                                      onBookingSuccess
                                  }: HotelPageProps) {
    // Основные состояния данных
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [checkIn, setCheckIn] = useState(initialCheckIn);
    const [checkOut, setCheckOut] = useState(initialCheckOut);
    const [guests, setGuests] = useState(initialGuests);

    // Состояния бронирования
    const [bookingState, setBookingState] = useState<BookingState | null>(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Состояния для выпадающего меню гостей
    const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
    const [options, setOptions] = useState({
        adults: initialGuests || 2,
        children: 0,
        rooms: 1,
    });

    const menuRef = useRef<HTMLDivElement>(null);

    // Закрытие меню при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsGuestMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOption = (name: 'adults' | 'children' | 'rooms', operation: 'i' | 'd') => {
        setOptions((prev) => {
            const newValue = operation === 'i' ? prev[name] + 1 : prev[name] - 1;
            const updated = { ...prev, [name]: newValue };
            // Синхронизируем общее кол-во гостей (взрослые + дети)
            setGuests(updated.adults + updated.children);
            return updated;
        });
    };

    const fetchRoomTypes = (ci = checkIn, co = checkOut) => {
        setLoadingRooms(true);
        const params: Record<string, string> = {};
        if (ci) params.checkIn = new Date(ci).toISOString();
        if (co) params.checkOut = new Date(co).toISOString();

        axios.get(`/api/hotels/${hotel.id}/roomtypes`, { params })
            .then(res => setRoomTypes(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoadingRooms(false));
    };

    useEffect(() => {
        fetchRoomTypes();
    }, [hotel.id]);

    const nights = checkIn && checkOut
        ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

    const handleSearch = () => {
        fetchRoomTypes(checkIn, checkOut);
        setBookingState(null);
    };

    const handleSelectRoom = (room: RoomType, roomsCount: number) => {
        setBookingState({
            roomTypeId: room.id,
            roomTypeName: room.name,
            pricePerNight: room.pricePerNight,
            rooms: roomsCount,
            guests: guests
        });
        setBookingError('');
    };

    const handleBook = async () => {
        if (!bookingState) return;
        if (!checkIn || !checkOut) {
            setBookingError('Выберите даты заезда и выезда');
            return;
        }

        setBookingLoading(true);
        setBookingError('');

        try {
            await axios.post('/api/bookings', {
                hotelId: hotel.id,
                roomTypeId: bookingState.roomTypeId,
                checkIn: new Date(checkIn).toISOString(),
                checkOut: new Date(checkOut).toISOString(),
                guests: bookingState.guests,
                rooms: bookingState.rooms
            });
            setBookingSuccess(true);
            onBookingSuccess();
        } catch (err: any) {
            if (err.response?.status === 401) {
                setBookingError('Войдите в аккаунт чтобы забронировать');
            } else {
                setBookingError(err.response?.data?.message || 'Ошибка при бронировании');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    const scrollToRooms = () => {
        document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const amenityIcons: Record<string, string> = {
        'Wi-Fi': '📶', 'Кондиционер': '❄️', 'ТВ': '📺',
        'Холодильник': '🧊', 'Ванная': '🛁', 'Душ': '🚿',
        'Балкон': '🌿', 'Сейф': '🔒', 'Фен': '💨',
        'Мини-бар': '🍷', 'Завтрак включён': '🍳', 'Парковка': '🅿️'
    };

    const totalPrice = bookingState ? bookingState.pricePerNight * nights * bookingState.rooms : 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Навигация */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 max-w-6xl">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                        ← Назад к списку
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                {/* 1. Верхний блок */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                                {hotel.propertyType}
                            </span>
                            <div className="flex gap-0.5 text-yellow-400 text-sm">
                                {'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{hotel.name}</h1>
                        <p className="text-blue-600 text-sm hover:underline cursor-pointer flex items-center gap-1">
                            📍 {hotel.address ? `${hotel.address}, ` : ''}{hotel.city} — Отличное расположение
                        </p>
                    </div>
                    <button onClick={scrollToRooms} className="bg-[#0071c2] hover:bg-[#005999] text-white font-bold px-6 py-2 rounded shadow-sm">
                        Забронировать
                    </button>
                </div>

                {/* 2. Галерея */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-96 mb-8 rounded-xl overflow-hidden">
                    <div className="md:col-span-2 h-full bg-gray-200 overflow-hidden">
                        <img src={hotel.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image'} alt={hotel.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="hidden md:flex flex-col gap-2 h-full">
                        <div className="h-1/2 bg-gray-200 overflow-hidden">
                            <img src={hotel.imageUrl || ''} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="h-1/2 bg-gray-200 relative overflow-hidden group cursor-pointer">
                            <img src={hotel.imageUrl || ''} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg">Больше фото</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Описание */}
                <div className="flex flex-col lg:flex-row gap-8 mb-10">
                    <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {hotel.description || 'Описание отсутствует.'}
                        </p>
                    </div>
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">Преимущества</h3>
                            <ul className="text-sm text-gray-700 flex flex-col gap-3 mb-5">
                                <li>📍 Отличное расположение</li>
                                <li>🅿️ Бесплатная парковка</li>
                            </ul>
                            <button onClick={scrollToRooms} className="w-full bg-[#0071c2] text-white font-bold py-2.5 rounded">
                                Показать номера
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Блок наличия мест */}
                <div id="availability-section" className="scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Наличие мест</h2>

                    <div className="bg-[#febb02] p-1 rounded-lg mb-6 relative z-20">
                        <div className="bg-white rounded-md flex flex-col md:flex-row">
                            {/* Заезд */}
                            <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-200 flex-1">
                                <input className="outline-none text-sm w-full" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                            </div>
                            {/* Выезд */}
                            <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-200 flex-1">
                                <input className="outline-none text-sm w-full" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                            </div>
                            {/* Гости */}
                            <div ref={menuRef} className="relative flex items-center gap-2 px-4 py-3 border-r border-gray-200 cursor-pointer flex-1" onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}>
                                <span className="text-sm text-gray-700 truncate">
                                    {options.adults} взр · {options.children} дет · {options.rooms} ном
                                </span>
                                {isGuestMenuOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-white shadow-xl border rounded-lg p-4 z-50" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-medium">Взрослые</span>
                                            <div className="flex items-center gap-3">
                                                <button disabled={options.adults <= 1} onClick={() => handleOption('adults', 'd')} className="w-8 h-8 border rounded">-</button>
                                                <span>{options.adults}</span>
                                                <button onClick={() => handleOption('adults', 'i')} className="w-8 h-8 border rounded">+</button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-medium">Дети</span>
                                            <div className="flex items-center gap-3">
                                                <button disabled={options.children <= 0} onClick={() => handleOption('children', 'd')} className="w-8 h-8 border rounded">-</button>
                                                <span>{options.children}</span>
                                                <button onClick={() => handleOption('children', 'i')} className="w-8 h-8 border rounded">+</button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Номера</span>
                                            <div className="flex items-center gap-3">
                                                <button disabled={options.rooms <= 1} onClick={() => handleOption('rooms', 'd')} className="w-8 h-8 border rounded">-</button>
                                                <span>{options.rooms}</span>
                                                <button onClick={() => handleOption('rooms', 'i')} className="w-8 h-8 border rounded">+</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={handleSearch} className="bg-[#0071c2] text-white font-bold px-8 py-3 rounded-r-md">Найти</button>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-[#003580] px-6 py-4">
                                <h2 className="text-white font-bold">Доступные номера</h2>
                            </div>
                            {loadingRooms ? (
                                <div className="p-12 text-center">Загрузка...</div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-bold uppercase">Тип номера</th>
                                        <th className="text-center px-4 py-4 text-xs font-bold uppercase">Вместимость</th>
                                        <th className="text-center px-4 py-4 text-xs font-bold uppercase">Цена</th>
                                        <th className="text-center px-4 py-4 text-xs font-bold uppercase">Выбор</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {roomTypes.map(room => (
                                        <RoomTypeRow
                                            key={room.id}
                                            room={room}
                                            nights={nights}
                                            amenityIcons={amenityIcons}
                                            isSelected={bookingState?.roomTypeId === room.id}
                                            onSelect={handleSelectRoom}
                                        />
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Корзина */}
                        <div className="lg:w-80 shrink-0">
                            <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-24">
                                <h3 className="font-bold text-xl mb-4">Бронирование</h3>
                                {bookingSuccess ? (
                                    <div className="text-center text-green-600 font-bold">Успешно забронировано!</div>
                                ) : bookingState ? (
                                    <>
                                        <p className="font-bold text-blue-700">{bookingState.roomTypeName}</p>
                                        <p className="text-sm text-gray-500 mb-4">{nights} ноч., {bookingState.guests} гост.</p>
                                        <div className="bg-blue-50 p-3 rounded mb-4">
                                            <div className="flex justify-between font-bold">
                                                <span>Итого:</span>
                                                <span>{totalPrice.toLocaleString()} ₸</span>
                                            </div>
                                        </div>
                                        {bookingError && <p className="text-red-500 text-xs mb-2">{bookingError}</p>}
                                        <button onClick={handleBook} disabled={bookingLoading} className="w-full bg-[#0071c2] text-white py-3 rounded-lg font-bold">
                                            {bookingLoading ? 'Загрузка...' : 'Забронировать'}
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-gray-400 text-sm">Выберите номер, чтобы продолжить</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RoomTypeRow({ room, nights, amenityIcons, isSelected, onSelect }: {
    room: RoomType;
    nights: number;
    amenityIcons: Record<string, string>;
    isSelected: boolean;
    onSelect: (room: RoomType, rooms: number) => void;
}) {
    const [selectedRooms, setSelectedRooms] = useState(1);
    const amenities = room.amenities ? room.amenities.split(',').map(a => a.trim()) : [];
    const isAvailable = room.availableRooms > 0;

    return (
        <tr className={`${isSelected ? 'bg-blue-50' : ''} ${!isAvailable ? 'opacity-50' : ''}`}>
            <td className="px-6 py-5">
                <p className="font-bold text-blue-700">{room.name}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {amenities.map(a => (
                        <span key={a} className="text-xs bg-gray-100 px-2 py-1 rounded" title={a}>
                            {amenityIcons[a] || '✔️'} {a}
                        </span>
                    ))}
                </div>
                {room.description && <p className="text-xs text-gray-500 mt-2">{room.description}</p>}
            </td>
            <td className="text-center text-sm">👤 × {room.maxGuests}</td>
            <td className="text-center font-bold">
                {nights > 0 ? (room.pricePerNight * nights).toLocaleString() : room.pricePerNight.toLocaleString()} ₸
            </td>
            <td className="px-4 text-center">
                <button
                    disabled={!isAvailable}
                    onClick={() => onSelect(room, selectedRooms)}
                    className={`px-4 py-2 rounded text-sm font-bold ${isSelected ? 'bg-green-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                    {isSelected ? 'Выбрано' : 'Выбрать'}
                </button>
            </td>
        </tr>
    );
}