import {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {ru} from 'date-fns/locale/ru';

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
    hotelAmenities?: string;
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
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [checkIn, setCheckIn] = useState(initialCheckIn);
    const [checkOut, setCheckOut] = useState(initialCheckOut);
    const [guests, setGuests] = useState(initialGuests);
    const [bookingState, setBookingState] = useState<BookingState | null>(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
    const [options, setOptions] = useState({
        adults: initialGuests || 2,
        children: 0,
        rooms: 1,
    });
    const [ownerContact, setOwnerContact] = useState<{ phone?: string; email?: string } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Хелперы для безопасной работы с DateOnly (строками YYYY-MM-DD)
    const parseDateString = (str: string) => {
        if (!str) return null;
        return new Date(str + 'T00:00:00');
    };

    const formatDateToString = (date: Date | null) => {
        if (!date) return '';
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

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
            const minValues = {adults: 1, children: 0, rooms: 1};
            const newValue = Math.max(
                minValues[name],
                operation === 'i' ? prev[name] + 1 : prev[name] - 1
            );
            const updated = {...prev, [name]: newValue};
            setGuests(updated.adults + updated.children);
            return updated;
        });
    };

    const fetchRoomTypes = (ci = checkIn, co = checkOut) => {
        setLoadingRooms(true);
        const params: Record<string, string> = {};
        if (ci) params.checkIn = ci;
        if (co) params.checkOut = co;

        axios.get(`/api/hotels/${hotel.id}/roomtypes`, {params})
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
                checkIn: checkIn,
                checkOut: checkOut,
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
        axios.get(`/api/hotels/${hotel.id}/owner-contact`)
            .then(res => setOwnerContact(res.data))
            .catch(() => {
            });
    };

    const scrollToRooms = () => {
        document.getElementById('availability-section')?.scrollIntoView({behavior: 'smooth'});
    };

    const amenityIcons: Record<string, string> = {
        'Wi-Fi': '📶', 'WiFi': '📶', 'Завтрак': '🍳',
        'Кондиционер': '❄️', 'Парковка': '🚗', 'Телевизор': '📺',
        'Бассейн': '🏊', 'Кухня': '🍳', 'Фен': '💨',
        'Вид на город': '🏙️', 'Рабочая зона': '💻', 'Кофемашина': '☕',
        'Ванная': '🛁', 'Душ': '🚿', 'Балкон': '🌿',
        'Сейф': '🔒', 'Мини-бар': '🍷', 'Холодильник': '🧊',
        'ТВ': '📺', 'Завтрак включён': '🍳',
    };

    const hotelAmenityIcons: Record<string, string> = {
        'Бесплатный Wi-Fi': '📶', 'Парковка': '🅿️', 'Бассейн': '🏊',
        'Ресторан': '🍽️', 'Спа': '💆', 'Фитнес-зал': '💪',
        'Конференц-зал': '📊', 'Трансфер из аэропорта': '✈️',
        'Завтрак включён': '🍳', 'Кондиционер': '❄️',
        'Лифт': '🛗', 'Круглосуточная стойка регистрации': '🕐'
    };

    const totalPrice = bookingState ? bookingState.pricePerNight * nights * bookingState.rooms : 0;

    const allUnavailable = roomTypes.length > 0 &&
        roomTypes.every(r => r.availableRooms <= 0) &&
        checkIn && checkOut;

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
                    <button
                        onClick={scrollToRooms}
                        className="bg-[#0071c2] hover:bg-[#005999] text-white font-bold px-6 py-2 rounded shadow-sm"
                    >
                        Забронировать
                    </button>
                </div>

                {/* 2. Галерея */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-96 mb-8 rounded-xl overflow-hidden">
                    <div className="md:col-span-2 h-full bg-gray-200 overflow-hidden">
                        <img
                            src={hotel.imageUrl || 'https://placehold.co/800x400?text=Нет+Фото'}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden md:flex flex-col gap-2 h-full">
                        <div className="h-1/2 bg-gray-100 overflow-hidden rounded-tr-xl">
                            {hotel.imageUrl ? (
                                <img src={hotel.imageUrl} alt={`${hotel.name} - вид 1`}
                                     className="w-full h-full object-cover hover:opacity-90 transition-opacity"/>
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-200">Нет
                                    Фото</div>
                            )}
                        </div>
                        <div className="h-1/2 bg-gray-100 relative overflow-hidden group cursor-pointer rounded-br-xl">
                            {hotel.imageUrl ? (
                                <img src={hotel.imageUrl} alt={`${hotel.name} - вид 2`}
                                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-200">Нет
                                    Фото</div>
                            )}
                            <div
                                className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                                <span
                                    className="text-white font-bold text-xs bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    Смотреть все фото
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Описание + Преимущества */}
                <div className="flex flex-col lg:flex-row gap-8 mb-10">
                    <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {hotel.description || 'Описание отсутствует.'}
                        </p>
                    </div>
                    <div className="lg:w-72 shrink-0 bg-blue-50 p-5 rounded-xl border border-blue-100 self-start">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">Преимущества</h3>
                        {hotel.hotelAmenities ? (
                            <ul className="text-sm text-gray-700 flex flex-col gap-2 mb-5">
                                {hotel.hotelAmenities.split(',').map(a => a.trim()).filter(Boolean).map(amenity => (
                                    <li key={amenity}>
                                        {hotelAmenityIcons[amenity] || '✓'} {amenity}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400 mb-5">Владелец не указал удобства</p>
                        )}
                        <button
                            onClick={scrollToRooms}
                            className="w-full bg-[#0071c2] text-white font-bold py-2.5 rounded hover:bg-[#005999] transition"
                        >
                            Показать номера
                        </button>
                    </div>
                </div>

                {/* 4. Наличие мест */}
                <div id="availability-section" className="scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Наличие мест</h2>

                    {/* Строка поиска */}
                    <div className="bg-[#febb02] p-1 rounded-lg mb-6 relative z-30 shadow-sm">
                        <div className="bg-white rounded-md flex flex-col md:flex-row items-stretch">

                            {/* ОБЪЕДИНЕННЫЙ КРАСИВЫЙ КАЛЕНДАРЬ */}
                            <div
                                className="flex items-center gap-3 px-4 py-2 border-r border-gray-200 flex-[2] min-w-[300px] hover:bg-gray-50 transition-colors cursor-pointer">
                                <span className="text-xl text-gray-400 select-none">📅</span>
                                <div className="w-full flex flex-col">
                                    <p className="text-xs text-gray-400 font-bold tracking-wider">Даты заезда — выезда</p>
                                    <DatePicker
                                        selectsRange={true}
                                        startDate={checkIn ? parseDateString(checkIn) : null}
                                        endDate={checkOut ? parseDateString(checkOut) : null}
                                        onChange={(update) => {
                                            const [start, end] = update;
                                            setCheckIn(start ? formatDateToString(start) : '');
                                            setCheckOut(end ? formatDateToString(end) : '');
                                        }}
                                        minDate={new Date()}
                                        locale={ru}
                                        dateFormat="dd.MM.yyyy"
                                        isClearable={true}
                                        placeholderText="Выберите период проживания"
                                        className="outline-none text-sm w-full font-semibold text-gray-800 bg-transparent cursor-pointer placeholder-gray-400 mt-0.5"
                                        wrapperClassName="w-full"

                                        // Новые пропсы для Booking-стиля:
                                        monthsShown={2} // Показывает 2 месяца одновременно
                                        renderDayContents={(day, date) => {
                                            // Проверяем, не прошлая ли это дата (чтобы не рисовать цены на прошедшие дни)
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const isPast = date < today;

                                            return (
                                                <div className="calendar-day-cell">
                                                    <span className="day-number">{day}</span>
                                                    {!isPast && (
                                                        <span className="day-price">
                        {hotel.pricePerNight.toLocaleString()} ₸
                    </span>
                                                    )}
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Гости и номера */}
                            <div
                                ref={menuRef}
                                className="relative flex items-center gap-3 px-4 py-2 border-r border-gray-200 cursor-pointer flex-1 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
                            >
                                <span className="text-xl text-gray-400 select-none">👤</span>
                                <div className="w-full flex flex-col">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Гости и
                                        номера</p>
                                    <span className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                                        {options.adults} взр · {options.children} дет · {options.rooms} ном
                                    </span>
                                </div>
                                {isGuestMenuOpen && (
                                    <div
                                        className="absolute top-full left-0 mt-2 w-72 bg-white shadow-xl border rounded-lg p-4 z-50 animate-fadeIn"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {(['adults', 'children', 'rooms'] as const).map((key) => (
                                            <div key={key} className="flex justify-between items-center mb-4 last:mb-0">
                                                <span className="text-sm font-medium text-gray-800">
                                                    {key === 'adults' ? 'Взрослые' : key === 'children' ? 'Дети' : 'Номера'}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        disabled={(key === 'adults' && options.adults <= 1) || (key === 'children' && options.children <= 0) || (key === 'rooms' && options.rooms <= 1)}
                                                        onClick={() => handleOption(key, 'd')}
                                                        className="w-8 h-8 border border-[#0071c2] text-[#0071c2] rounded font-bold disabled:opacity-30 hover:bg-blue-50 transition"
                                                    >−
                                                    </button>
                                                    <span
                                                        className="w-4 text-center font-semibold text-gray-800">{options[key]}</span>
                                                    <button
                                                        onClick={() => handleOption(key, 'i')}
                                                        className="w-8 h-8 border border-[#0071c2] text-[#0071c2] rounded font-bold hover:bg-blue-50 transition"
                                                    >+
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsGuestMenuOpen(false);
                                            }}
                                            className="w-full mt-4 border border-[#0071c2] bg-[#0071c2] text-white font-bold py-2 rounded hover:bg-[#005999] transition"
                                        >
                                            Готово
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-[#0071c2] hover:bg-[#005999] text-white font-bold px-8 py-3 rounded-r-md transition text-base shrink-0"
                            >
                                Найти
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Таблица номеров */}
                        <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-[#003580] px-6 py-4">
                                <h2 className="text-white font-bold">Доступные номера</h2>
                                {nights > 0 && (
                                    <p className="text-blue-200 text-sm mt-0.5">
                                        {checkIn} — {checkOut} · {nights} ноч. · {guests} гост.
                                    </p>
                                )}
                            </div>

                            {loadingRooms ? (
                                <div className="p-12 text-center">
                                    <div
                                        className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : roomTypes.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-4xl mb-3">🛏</p>
                                    <p className="text-gray-500 font-bold">Типы номеров не добавлены</p>
                                    <p className="text-gray-400 text-sm mt-1">Владелец ещё не настроил номера</p>
                                </div>
                            ) : allUnavailable ? (
                                <div className="p-12 text-center">
                                    <p className="text-4xl mb-3">😔</p>
                                    <p className="text-gray-700 font-bold text-lg">Нет свободных номеров</p>
                                    <p className="text-gray-400 text-sm mt-1">На выбранные даты все номера заняты</p>
                                    <p className="text-gray-400 text-sm">Попробуйте другие даты</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-xs font-bold uppercase text-gray-600">Тип
                                                номера
                                            </th>
                                            <th className="text-center px-4 py-4 text-xs font-bold uppercase text-gray-600">Вместимость</th>
                                            <th className="text-center px-4 py-4 text-xs font-bold uppercase text-gray-600">
                                                {nights > 0 ? `Цена за ${nights} ноч.` : 'Цена/ночь'}
                                            </th>
                                            <th className="text-center px-4 py-4 text-xs font-bold uppercase text-gray-600">Доступно</th>
                                            <th className="text-center px-4 py-4 text-xs font-bold uppercase text-gray-600">Выбор</th>
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
                                                defaultRooms={options.rooms}
                                            />
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Корзина */}
                        <div className="lg:w-80 shrink-0">
                            <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-24">
                                <h3 className="font-bold text-xl mb-4">Бронирование</h3>
                                {bookingSuccess ? (
                                    <div className="text-center py-6">
                                        <div className="text-4xl mb-3">✅</div>
                                        <p className="text-green-700 font-bold text-lg">Успешно забронировано!</p>
                                        <p className="text-green-600 text-sm mt-1">{hotel.name}</p>
                                        <p className="text-green-800 font-bold text-xl mt-2">{totalPrice.toLocaleString()} ₸</p>

                                        {ownerContact && (ownerContact.phone || ownerContact.email) && (
                                            <div className="mt-4 bg-blue-50 rounded-lg p-4 text-left">
                                                <p className="text-sm font-bold text-gray-700 mb-2">📞 Контакты
                                                    владельца:</p>
                                                {ownerContact.phone && (
                                                    <a
                                                        href={"tel:" + ownerContact.phone}
                                                        className="block text-blue-600 font-bold text-lg hover:underline"
                                                    >
                                                        {ownerContact.phone}
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            onClick={onBack}
                                            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
                                        >
                                            Отлично!
                                        </button>
                                    </div>
                                ) : bookingState ? (
                                    <>
                                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                            <p className="font-bold text-blue-700">{bookingState.roomTypeName}</p>
                                            <p className="text-sm text-gray-600 mt-1">🛏 {bookingState.rooms} номер ·
                                                👤 {bookingState.guests} гост.</p>
                                            {checkIn && checkOut && (
                                                <>
                                                    <p className="text-sm text-gray-600">📅 {checkIn} — {checkOut}</p>
                                                    <p className="text-sm text-gray-600">🌙 {nights} ноч.</p>
                                                </>
                                            )}
                                        </div>
                                        {nights > 0 && (
                                            <div className="border-t pt-4 mb-4">
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>{bookingState.pricePerNight.toLocaleString()} ₸ × {nights} ноч.</span>
                                                    <span>{(bookingState.pricePerNight * nights).toLocaleString()} ₸</span>
                                                </div>
                                                {bookingState.rooms > 1 && (
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        <span>× {bookingState.rooms} номеров</span>
                                                        <span>{totalPrice.toLocaleString()} ₸</span>
                                                    </div>
                                                )}
                                                <div
                                                    className="flex justify-between font-bold text-gray-900 text-lg mt-2">
                                                    <span>Итого</span>
                                                    <span>{totalPrice.toLocaleString()} ₸</span>
                                                </div>
                                            </div>
                                        )}
                                        {bookingError && (
                                            <div
                                                className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
                                                {bookingError}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleBook}
                                            disabled={bookingLoading || !checkIn || !checkOut}
                                            className="w-full bg-[#0071c2] hover:bg-[#005999] disabled:bg-gray-300 text-white py-3 rounded-lg font-bold transition"
                                        >
                                            {bookingLoading ? 'Оформляем...' : 'Забронировать'}
                                        </button>
                                        {(!checkIn || !checkOut) && (
                                            <p className="text-xs text-gray-400 text-center mt-2">Выберите даты чтобы
                                                продолжить</p>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-4xl mb-3">🛏</p>
                                        <p className="text-gray-400 text-sm">Выберите номер из таблицы слева</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RoomTypeRow({room, nights, amenityIcons, isSelected, onSelect, defaultRooms}: {
    room: RoomType;
    nights: number;
    amenityIcons: Record<string, string>;
    isSelected: boolean;
    onSelect: (room: RoomType, rooms: number) => void;
    defaultRooms: number;
}) {
    const amenities = room.amenities ? room.amenities.split(',').map(a => a.trim()) : [];
    const isAvailable = room.availableRooms > 0;

    return (
        <tr className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} ${!isAvailable ? 'opacity-50' : ''} transition`}>
            <td className="px-6 py-5 align-top">
                {room.imageUrl && (
                    <img
                        src={room.imageUrl}
                        alt={room.name}
                        className="w-full h-28 object-cover rounded-lg mb-3"
                    />
                )}
                <p className="font-bold text-blue-700">{room.name}</p>
                {room.description && (
                    <p className="text-xs text-gray-500 mt-1">{room.description}</p>
                )}
                {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {amenities.map(a => (
                            <span key={a} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                {amenityIcons[a] || '✓'} {a}
                            </span>
                        ))}
                    </div>
                )}
            </td>
            <td className="text-center px-4 py-5 align-top">
                <div className="flex justify-center gap-0.5">
                    {Array.from({length: Math.min(room.maxGuests, 4)}).map((_, i) => (
                        <span key={i} className="text-sm">👤</span>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">до {room.maxGuests}</p>
            </td>
            <td className="text-center px-4 py-5 align-top font-semibold text-gray-900">
                {nights > 0 ? (room.pricePerNight * nights).toLocaleString() : room.pricePerNight.toLocaleString()} ₸
            </td>
            <td className="text-center px-4 py-5 align-top">
                {isAvailable ? (
                    <span className="text-green-600 font-bold text-sm">Осталось: {room.availableRooms}</span>
                ) : (
                    <span className="text-red-500 font-bold text-sm">Мест нет</span>
                )}
            </td>
            <td className="text-center px-4 py-5 align-top">
                <button
                    disabled={!isAvailable}
                    onClick={() => onSelect(room, defaultRooms)}
                    className={`px-4 py-2 text-xs font-bold rounded transition shadow-sm ${
                        isSelected
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none'
                    }`}
                >
                    {isSelected ? '✓ Выбран' : 'Выбрать'}
                </button>
            </td>
        </tr>
    );
}