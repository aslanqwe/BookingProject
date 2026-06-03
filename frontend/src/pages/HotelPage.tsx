import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale/ru';
import BookingCheckout from '../components/BookingCheckout';
import RoomTypeRow, { AMENITY_ICONS } from '../components/RoomTypeRow';
import { useRoomTypes } from '../hooks/useRoomTypes';
import type { Hotel, RoomType } from '../types';

// Иконки удобств отеля 
const HOTEL_AMENITY_ICONS: Record<string, string> = {
    'Бесплатный Wi-Fi': '📶', 'Парковка': '🅿️', 'Бассейн': '🏊',
    'Ресторан': '🍽️', 'Спа': '💆', 'Фитнес-зал': '💪',
    'Конференц-зал': '📊', 'Трансфер из аэропорта': '✈️',
    'Завтрак включён': '🍳', 'Кондиционер': '❄️',
    'Лифт': '🛗', 'Круглосуточная стойка регистрации': '🕐',
};

// Хелперы для дат 
const parseDateString = (str: string): Date | null => {
    if (!str) return null;
    return new Date(str + 'T00:00:00');
};

const formatDateToString = (date: Date | null): string => {
    if (!date) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Интерфейсы 
interface BookingState {
    roomTypeId: number;
    roomTypeName: string;
    pricePerNight: number;
    rooms: number;
    guests: number;
}

interface HotelPageProps {
    hotel: Hotel;
    checkIn: string;
    checkOut: string;
    guests: number;
    onBack: () => void;
    onBookingSuccess: () => void;
}

// Компонент 
export default function HotelPage({
                                      hotel,
                                      checkIn: initialCheckIn,
                                      checkOut: initialCheckOut,
                                      guests: initialGuests,
                                      onBack,
                                  }: HotelPageProps) {
    // Даты и гости 
    const [checkIn, setCheckIn] = useState(initialCheckIn);
    const [checkOut, setCheckOut] = useState(initialCheckOut);
    const [guests, setGuests] = useState(initialGuests);
    const [options, setOptions] = useState({ adults: initialGuests || 2, children: 0, rooms: 1 });

    //Бронирование 
    const [bookingState, setBookingState] = useState<BookingState | null>(null);
    const [bookingError, setBookingError] = useState('');

    //Checkout (форма с данными гостя)
    const [checkoutData, setCheckoutData] = useState<{
        roomType: { id: number; name: string; pricePerNight: number; maxGuests: number };
        rooms: number;
    } | null>(null);

    // UI 
    const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Хук для типов номеров 
    const { roomTypes, loading: loadingRooms, fetchRoomTypes } = useRoomTypes(hotel.id);

    // Закрытие меню по клику вне 
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsGuestMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Первая загрузка номеров 
    useEffect(() => {
        fetchRoomTypes();
    }, [hotel.id, fetchRoomTypes]);

    // Расчёт ночей 
    const nights = checkIn && checkOut
        ? Math.max(0, Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
        ))
        : 0;

    const totalPrice = bookingState ? bookingState.pricePerNight * nights * bookingState.rooms : 0;
    const allUnavailable = roomTypes.length > 0 && roomTypes.every(r => r.availableRooms <= 0) && !!checkIn && !!checkOut;

    // Обработчики 
    const handleOption = (name: 'adults' | 'children' | 'rooms', op: 'i' | 'd') => {
        setOptions(prev => {
            const min = { adults: 1, children: 0, rooms: 1 }[name];
            const newVal = Math.max(min, op === 'i' ? prev[name] + 1 : prev[name] - 1);
            const updated = { ...prev, [name]: newVal };
            setGuests(updated.adults + updated.children);
            return updated;
        });
    };

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
            guests,
        });
        setBookingError('');
    };

    const handleBook = () => {
        if (!bookingState) return;
        if (!checkIn || !checkOut) {
            setBookingError('Выберите даты заезда и выезда');
            return;
        }
        setCheckoutData({
            roomType: {
                id: bookingState.roomTypeId,
                name: bookingState.roomTypeName,
                pricePerNight: bookingState.pricePerNight,
                maxGuests: roomTypes.find(r => r.id === bookingState.roomTypeId)?.maxGuests ?? 2,
            },
            rooms: bookingState.rooms,
        });
    };

    const scrollToRooms = () => {
        document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Показываем Checkout если гость нажал "Забронировать" 
    if (checkoutData) {
        return (
            <BookingCheckout
                hotel={{ id: hotel.id, name: hotel.name, city: hotel.city, address: hotel.address, imageUrl: hotel.imageUrl }}
                roomType={checkoutData.roomType}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                rooms={checkoutData.rooms}
                nights={nights}
                userEmail=""
                onBack={() => setCheckoutData(null)}
                onSuccess={() => {}}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Навигация */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 max-w-6xl">
                    <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                        ← Назад к списку
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                {/* ── Верхний блок ──────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">{hotel.propertyType}</span>
                            <div className="flex gap-0.5 text-yellow-400 text-sm">
                                {'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{hotel.name}</h1>
                        <p className="text-blue-600 text-sm cursor-pointer hover:underline">
                            📍 {hotel.address ? `${hotel.address}, ` : ''}{hotel.city}
                        </p>
                    </div>
                    <button onClick={scrollToRooms} className="bg-[#0071c2] hover:bg-[#005999] text-white font-bold px-6 py-2 rounded shadow-sm shrink-0">
                        Забронировать
                    </button>
                </div>

                {/* ── Галерея ───────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-72 md:h-96 mb-8 rounded-xl overflow-hidden">
                    <div className="md:col-span-2 h-full bg-gray-200 overflow-hidden">
                        <img
                            src={hotel.imageUrl || 'https://placehold.co/800x400?text=Нет+Фото'}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden md:flex flex-col gap-2 h-full">
                        <div className="h-1/2 bg-gray-100 overflow-hidden rounded-tr-xl">
                            <img src={hotel.imageUrl || 'https://placehold.co/400x200?text=Фото'} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                        </div>
                        <div className="h-1/2 bg-gray-100 relative overflow-hidden group cursor-pointer rounded-br-xl">
                            <img src={hotel.imageUrl || 'https://placehold.co/400x200?text=Фото'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <span className="text-white font-bold text-xs bg-black/50 px-3 py-1.5 rounded-lg">Смотреть все фото</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Описание + Удобства  */}
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
                                    <li key={amenity}>{HOTEL_AMENITY_ICONS[amenity] || '✓'} {amenity}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400 mb-5">Владелец не указал удобства</p>
                        )}
                        <button onClick={scrollToRooms} className="w-full bg-[#0071c2] text-white font-bold py-2.5 rounded hover:bg-[#005999] transition">
                            Показать номера
                        </button>
                    </div>
                </div>

                {/*  Наличие мест  */}
                <div id="availability-section" className="scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Наличие мест</h2>

                    {/* Строка поиска */}
                    <div className="bg-[#febb02] p-1 rounded-lg mb-6 relative z-20 shadow-sm">
                        <div className="bg-white rounded-md flex flex-col md:flex-row items-stretch">
                            {/* Даты */}
                            <div className="flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 flex-1 min-w-[240px]">
                                <span className="text-xl text-gray-400 select-none">📅</span>
                                <div className="w-full">
                                    <p className="text-xs text-gray-400 font-bold">Даты заезда — выезда</p>
                                    <DatePicker
                                        selectsRange
                                        startDate={parseDateString(checkIn)}
                                        endDate={parseDateString(checkOut)}
                                        onChange={([start, end]) => {
                                            setCheckIn(formatDateToString(start));
                                            setCheckOut(formatDateToString(end));
                                        }}
                                        minDate={new Date()}
                                        locale={ru}
                                        dateFormat="dd.MM.yyyy"
                                        isClearable
                                        placeholderText="Выберите период"
                                        className="outline-none text-sm w-full font-semibold text-gray-800 bg-transparent cursor-pointer placeholder-gray-400 mt-0.5"
                                        wrapperClassName="w-full"
                                        monthsShown={2}
                                    />
                                </div>
                            </div>

                            {/* Гости */}
                            <div
                                ref={menuRef}
                                className="relative flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 cursor-pointer flex-1"
                                onClick={() => setIsGuestMenuOpen(prev => !prev)}
                            >
                                <span className="text-xl text-gray-400 select-none">👤</span>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Гости и номера</p>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {options.adults} взр · {options.children} дет · {options.rooms} ном
                                    </span>
                                </div>

                                {isGuestMenuOpen && (
                                    <div
                                        className="absolute top-full left-0 mt-2 w-72 bg-white shadow-xl border rounded-lg p-4 z-50"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {(['adults', 'children', 'rooms'] as const).map(key => (
                                            <div key={key} className="flex justify-between items-center mb-4 last:mb-0">
                                                <span className="text-sm font-medium">
                                                    {{ adults: 'Взрослые', children: 'Дети', rooms: 'Номера' }[key]}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        disabled={(key === 'adults' && options.adults <= 1) || (key === 'children' && options.children <= 0) || (key === 'rooms' && options.rooms <= 1)}
                                                        onClick={() => handleOption(key, 'd')}
                                                        className="w-8 h-8 border border-[#0071c2] text-[#0071c2] rounded font-bold disabled:opacity-30 hover:bg-blue-50 transition"
                                                    >−</button>
                                                    <span className="w-4 text-center font-semibold">{options[key]}</span>
                                                    <button onClick={() => handleOption(key, 'i')} className="w-8 h-8 border border-[#0071c2] text-[#0071c2] rounded font-bold hover:bg-blue-50 transition">+</button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={e => { e.stopPropagation(); setIsGuestMenuOpen(false); }}
                                            className="w-full mt-4 bg-[#0071c2] text-white font-bold py-2 rounded hover:bg-[#005999] transition"
                                        >
                                            Готово
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button onClick={handleSearch} className="bg-[#0071c2] hover:bg-[#005999] text-white font-bold px-8 py-3 rounded-b-md md:rounded-r-md md:rounded-b-none transition">
                                Найти
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* ── Таблица номеров ───────────────────────────────── */}
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
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            ) : roomTypes.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-4xl mb-3">🛏</p>
                                    <p className="text-gray-500 font-bold">Типы номеров не добавлены</p>
                                </div>
                            ) : allUnavailable ? (
                                <div className="p-12 text-center">
                                    <p className="text-4xl mb-3">😔</p>
                                    <p className="text-gray-700 font-bold text-lg">Нет свободных номеров</p>
                                    <p className="text-gray-400 text-sm mt-1">Попробуйте другие даты</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-xs font-bold uppercase text-gray-600">Тип номера</th>
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

                        {/* ── Корзина бронирования ──────────────────────────── */}
                        <div className="lg:w-80 shrink-0">
                            <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-24">
                                <h3 className="font-bold text-xl mb-4">Бронирование</h3>

                                {bookingState ? (
                                    <>
                                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                            <p className="font-bold text-blue-700">{bookingState.roomTypeName}</p>
                                            <p className="text-sm text-gray-600 mt-1">🛏 {bookingState.rooms} ном · 👤 {bookingState.guests} гост.</p>
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
                                                <div className="flex justify-between font-bold text-gray-900 text-lg mt-2">
                                                    <span>Итого</span>
                                                    <span>{totalPrice.toLocaleString()} ₸</span>
                                                </div>
                                            </div>
                                        )}

                                        {bookingError && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
                                                {bookingError}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleBook}
                                            disabled={!checkIn || !checkOut}
                                            className="w-full bg-[#0071c2] hover:bg-[#005999] disabled:bg-gray-300 text-white py-3 rounded-lg font-bold transition"
                                        >
                                            Забронировать
                                        </button>
                                        {(!checkIn || !checkOut) && (
                                            <p className="text-xs text-gray-400 text-center mt-2">Выберите даты чтобы продолжить</p>
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