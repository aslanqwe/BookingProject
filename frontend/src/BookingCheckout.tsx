import { useState } from 'react';
import axios from 'axios';

interface BookingCheckoutProps {
    hotel: {
        id: number;
        name: string;
        city: string;
        address?: string;
        imageUrl?: string;
    };
    roomType: {
        id: number;
        name: string;
        pricePerNight: number;
        maxGuests: number;
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    nights: number;
    userEmail: string;
    onBack: () => void;
    onSuccess: () => void;
}

export default function BookingCheckout({
                                            hotel, roomType, checkIn, checkOut,
                                            guests, rooms, nights, userEmail,
                                            onBack, onSuccess
                                        }: BookingCheckoutProps) {
    const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        guestName: '',
        guestEmail: userEmail,
        guestPhone: '',
        specialRequests: '',
        isForSelf: true,
    });

    const totalPrice = roomType.pricePerNight * nights * rooms;

    const handleSubmitDetails = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.guestName.trim()) { setError('Введите имя'); return; }
        if (!formData.guestPhone.trim()) { setError('Введите телефон'); return; }
        setError('');
        setStep('confirm');
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError('');
        try {
            // Безопасно форматируем даты в строку YYYY-MM-DD для C# DateOnly
            const formattedCheckIn = new Date(checkIn).toISOString().split('T')[0];
            const formattedCheckOut = new Date(checkOut).toISOString().split('T')[0];

            await axios.post('/api/bookings', {
                hotelId: hotel.id,
                roomTypeId: roomType.id,
                checkIn: formattedCheckIn,   
                checkOut: formattedCheckOut, 
                guests,
                rooms,
                guestName: formData.guestName,
                guestEmail: formData.guestEmail,
                guestPhone: formData.guestPhone,
                specialRequests: formData.specialRequests
            });
            setStep('success');
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Ошибка при бронировании');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Прогресс */}
            <div className="bg-[#003580] text-white py-4">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 ${step !== 'details' ? 'opacity-60' : ''}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'details' ? 'bg-white text-[#003580]' : 'bg-green-400 text-white'}`}>
                                {step === 'details' ? '1' : '✓'}
            </span>
                            Ваш выбор
                        </div>
                        <div className="flex-1 h-px bg-white/30"></div>
                        <div className={`flex items-center gap-2 ${step === 'details' ? 'opacity-60' : ''}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'confirm' ? 'bg-white text-[#003580]' : step === 'success' ? 'bg-green-400 text-white' : 'bg-white/30 text-white'}`}>
                                {step === 'success' ? '✓' : '2'}
                            </span>
                            Ваши данные
                        </div>
                        <div className="flex-1 h-px bg-white/30"></div>
                        <div className={`flex items-center gap-2 ${step !== 'success' ? 'opacity-60' : ''}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'success' ? 'bg-green-400 text-white' : 'bg-white/30 text-white'}`}>3</span>
                            Завершение
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ЛЕВАЯ ЧАСТЬ */}
                    <div className="flex-1">
                        {step === 'details' && (
                            <div className="bg-white rounded-xl border shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {userEmail.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">Вы вошли в свой аккаунт</p>
                                        <p className="text-sm text-gray-500">{userEmail}</p>
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-gray-800 mb-6">Введите свои данные</h2>

                                <form onSubmit={handleSubmitDetails} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Имя <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border rounded-lg p-3 text-sm outline-none focus:border-blue-500"
                                                value={formData.guestName}
                                                onChange={e => setFormData({...formData, guestName: e.target.value})}
                                                placeholder="Ваше имя"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Телефон <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                className="w-full border rounded-lg p-3 text-sm outline-none focus:border-blue-500"
                                                value={formData.guestPhone}
                                                onChange={e => setFormData({...formData, guestPhone: e.target.value})}
                                                placeholder="+7 777 123 45 67"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Электронный адрес <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full border rounded-lg p-3 text-sm outline-none focus:border-blue-500"
                                            value={formData.guestEmail}
                                            onChange={e => setFormData({...formData, guestEmail: e.target.value})}
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-1">На этот адрес будет отправлено подтверждение</p>
                                    </div>

                                    <div className="border rounded-xl p-4 bg-gray-50">
                                        <h3 className="font-bold text-gray-800 mb-3">Кто основной гость?</h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={formData.isForSelf}
                                                    onChange={() => setFormData({...formData, isForSelf: true})}
                                                    className="accent-blue-600"
                                                />
                                                <span className="text-sm">Я</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={!formData.isForSelf}
                                                    onChange={() => setFormData({...formData, isForSelf: false})}
                                                    className="accent-blue-600"
                                                />
                                                <span className="text-sm">Другой человек</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">Особые пожелания</h3>
                                        <p className="text-xs text-gray-500 mb-2">Администрация постарается выполнить ваши пожелания, но не может их гарантировать.</p>
                                        <textarea
                                            className="w-full border rounded-lg p-3 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                                            placeholder="Например: поздний заезд, тихий номер, высокий этаж..."
                                            value={formData.specialRequests}
                                            onChange={e => setFormData({...formData, specialRequests: e.target.value})}
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-bold text-gray-800 mb-2">Полезно знать:</h3>
                                        <ul className="text-sm text-gray-600 flex flex-col gap-1">
                                            <li className="flex items-center gap-2">✅ Банковская карта не нужна</li>
                                            <li className="flex items-center gap-2">✅ Оплата производится на месте</li>
                                            <li className="flex items-center gap-2">✅ Бесплатная отмена до даты заезда</li>
                                        </ul>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-[#0071c2] hover:bg-[#005999] text-white font-bold py-3 rounded-lg transition text-lg"
                                    >
                                        Далее: подтверждение →
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 'confirm' && (
                            <div className="bg-white rounded-xl border shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Подтверждение бронирования</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-bold text-gray-700 mb-3">Данные гостя</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-400">Имя</p>
                                                <p className="font-medium">{formData.guestName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Телефон</p>
                                                <p className="font-medium">{formData.guestPhone}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-gray-400">Email</p>
                                                <p className="font-medium">{formData.guestEmail}</p>
                                            </div>
                                            {formData.specialRequests && (
                                                <div className="col-span-2">
                                                    <p className="text-gray-400">Особые пожелания</p>
                                                    <p className="font-medium">{formData.specialRequests}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-bold text-gray-700 mb-3">Детали бронирования</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-400">Заезд</p>
                                                <p className="font-bold">{formatDate(checkIn)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Выезд</p>
                                                <p className="font-bold">{formatDate(checkOut)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Тип номера</p>
                                                <p className="font-medium">{roomType.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Гостей / Номеров</p>
                                                <p className="font-medium">{guests} чел. / {rooms} ном.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep('details')}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        ← Назад
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={loading}
                                        className="flex-1 bg-[#0071c2] hover:bg-[#005999] disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition text-lg"
                                    >
                                        {loading ? 'Оформляем...' : `Забронировать · ${totalPrice.toLocaleString()} ₸`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
                                <div className="text-6xl mb-4">✅</div>
                                <h2 className="text-2xl font-bold text-green-700 mb-2">Бронирование подтверждено!</h2>
                                <p className="text-gray-600 mb-1">{hotel.name} · {hotel.city}</p>
                                <p className="text-gray-600 mb-1">{roomType.name}</p>
                                <p className="text-gray-600 mb-4">{formatDate(checkIn)} — {formatDate(checkOut)} · {nights} ноч.</p>
                                <p className="text-2xl font-bold text-[#003580] mb-6">{totalPrice.toLocaleString()} ₸</p>
                                <div className="bg-blue-50 rounded-lg p-4 text-left mb-6">
                                    <p className="text-sm font-bold text-gray-700 mb-1">📧 Подтверждение отправлено на:</p>
                                    <p className="text-blue-600">{formData.guestEmail}</p>
                                </div>
                                <button
                                    onClick={onBack}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                                >
                                    Отлично! На главную
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ — сводка */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden sticky top-4">
                            {hotel.imageUrl && (
                                <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-40 object-cover" />
                            )}
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 text-lg">{hotel.name}</h3>
                                {hotel.address && <p className="text-sm text-gray-500 mt-0.5">📍 {hotel.address}, {hotel.city}</p>}

                                <div className="border-t mt-4 pt-4">
                                    <h4 className="font-bold text-gray-700 mb-3">Детали вашего бронирования</h4>
                                    <div className="flex justify-between text-sm mb-2">
                                        <div>
                                            <p className="text-gray-400 text-xs">Заезд</p>
                                            <p className="font-bold">{formatDate(checkIn)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 text-xs">Выезд</p>
                                            <p className="font-bold">{formatDate(checkOut)}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{nights} ноч. · {guests} гост. · {rooms} ном.</p>
                                </div>

                                <div className="border-t mt-4 pt-4">
                                    <p className="text-sm text-gray-600 font-medium">Вы выбрали:</p>
                                    <p className="text-sm font-bold text-gray-800 mt-1">1 × {roomType.name}</p>
                                </div>

                                <div className="border-t mt-4 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-800">Итого</span>
                                        <span className="text-xl font-bold text-[#003580]">{totalPrice.toLocaleString()} ₸</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Включая все сборы</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}