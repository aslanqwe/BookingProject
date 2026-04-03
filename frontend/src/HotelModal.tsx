import React, { useState } from 'react';
import axios from 'axios';

interface Hotel {
    id: number;
    name: string;
    city: string;
    pricePerNight: number;
    description?: string;
}

interface HotelModalProps {
    hotel: Hotel | null;
    onClose: () => void;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
}

const HotelModal: React.FC<HotelModalProps> = ({ hotel, onClose, checkIn: initialCheckIn = '', checkOut: initialCheckOut = '', guests: initialGuests = 2 }) => {
    const [checkIn, setCheckIn] = useState(initialCheckIn);
    const [checkOut, setCheckOut] = useState(initialCheckOut);
    const [guests, setGuests] = useState(initialGuests);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!hotel) return null;

    const nights = checkIn && checkOut
        ? Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const totalPrice = nights * hotel.pricePerNight;

    const handleBook = async () => {
        if (!checkIn || !checkOut) {
            setError('Выберите даты заезда и выезда');
            return;
        }
        if (nights <= 0) {
            setError('Дата выезда должна быть позже даты заезда');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post('/api/bookings', {
                hotelId: hotel.id,
                checkIn: new Date(checkIn).toISOString(),
                checkOut: new Date(checkOut).toISOString(),
                guests
            });
            setSuccess(true);
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('Войдите в аккаунт чтобы забронировать');
            } else {
                setError(err.response?.data?.message || 'Ошибка при бронировании');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden relative">

                {/* Кнопка закрытия */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 bg-white rounded-full p-1 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Фото-заглушка */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center relative">
                    <span className="text-blue-400 font-bold text-4xl opacity-50">{hotel.name}</span>
                    <div className="absolute bottom-4 left-4 bg-[#003580] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                        📍 {hotel.city}
                    </div>
                </div>

                <div className="p-6">
                    {/* Заголовок */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
                            <p className="text-gray-500 text-sm mt-1">{hotel.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                            <p className="text-2xl font-bold text-[#003580]">{hotel.pricePerNight.toLocaleString()} ₸</p>
                            <p className="text-xs text-gray-400">за ночь</p>
                        </div>
                    </div>

                    {success ? (
                        /* Успешное бронирование */
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                            <div className="text-4xl mb-2">✅</div>
                            <h3 className="text-lg font-bold text-green-800 mb-1">Бронирование подтверждено!</h3>
                            <p className="text-green-600 text-sm mb-1">{hotel.name} · {hotel.city}</p>
                            <p className="text-green-600 text-sm mb-1">{checkIn} — {checkOut} · {guests} гост.</p>
                            <p className="text-green-800 font-bold text-lg mt-2">{totalPrice.toLocaleString()} ₸</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                            >
                                Отлично!
                            </button>
                        </div>
                    ) : (
                        /* Форма бронирования */
                        <>
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                <h3 className="font-semibold text-gray-700 mb-3">Выберите даты</h3>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Заезд</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                                            value={checkIn}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => setCheckIn(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Выезд</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                                            value={checkOut}
                                            min={checkIn || new Date().toISOString().split('T')[0]}
                                            onChange={e => setCheckOut(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Количество гостей</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setGuests(g => Math.max(1, g - 1))}
                                            className="w-8 h-8 rounded-full border border-blue-600 text-blue-600 font-bold flex items-center justify-center hover:bg-blue-50"
                                        >−</button>
                                        <span className="font-semibold text-gray-800 w-6 text-center">{guests}</span>
                                        <button
                                            onClick={() => setGuests(g => g + 1)}
                                            className="w-8 h-8 rounded-full border border-blue-600 text-blue-600 font-bold flex items-center justify-center hover:bg-blue-50"
                                        >+</button>
                                        <span className="text-sm text-gray-500">гостей</span>
                                    </div>
                                </div>
                            </div>

                            {/* Итог */}
                            {nights > 0 && (
                                <div className="bg-blue-50 rounded-xl p-4 mb-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            {hotel.pricePerNight.toLocaleString()} ₸ × {nights} ноч.
                                        </p>
                                        <p className="text-xs text-gray-400">{guests} гостей</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Итого</p>
                                        <p className="text-xl font-bold text-[#003580]">{totalPrice.toLocaleString()} ₸</p>
                                    </div>
                                </div>
                            )}

                            {/* Ошибка */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
                                    {error}
                                </div>
                            )}

                            {/* Кнопки */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBook}
                                    disabled={loading}
                                    className="flex-1 bg-[#0071c2] hover:bg-[#005999] disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition"
                                >
                                    {loading ? 'Оформляем...' : 'Забронировать'}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Закрыть
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotelModal;