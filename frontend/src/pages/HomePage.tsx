import { useState, useEffect, useRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale/ru';
import HotelCard, { type Hotel } from '../components/HotelCard';
import { useHotels } from '../hooks/useHotels';

const PROPERTY_TYPE_TABS = [
    { value: '', label: '🏠 Все' },
    { value: 'Отель', label: '🏨 Отели' },
    { value: 'Апартаменты', label: '🏢 Апарт.' },
    { value: 'Хостел', label: '🛏 Хостел' },
    { value: 'Гостевой дом', label: '🏠 Гост. дом' },
    { value: 'Вилла', label: '🌴 Вилла' },
];

const PAGE_SIZE = 5;

// Вспомогательные функции для дат 
const parseStringToDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const formatDateToString = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getRoomsText = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${count} ном.`;
    if (lastDigit === 1) return `${count} номер`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${count} ном.`;
    return `${count} ном.`;
};


export default function HomePage() {
    // Хук для отелей — вся логика запросов внутри 
    const { hotels, totalPages, totalCount, currentPage, fetchHotels } = useHotels();

    // Фильтры 
    const [searchCity, setSearchCity] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [maxPrice, setMaxPrice] = useState(500000);
    const [filterStars, setFilterStars] = useState(0);
    const [sortBy, setSortBy] = useState('');
    const [filterPropertyType, setFilterPropertyType] = useState('');

    // UI стейты 
    const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [priceTimer, setPriceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const guestMenuRef = useRef<HTMLDivElement>(null);

    // Закрытие гостевого меню по клику вне 
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (guestMenuRef.current && !guestMenuRef.current.contains(e.target as Node)) {
                setIsGuestMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Собираем параметры и делаем запрос
    const search = useCallback((overrides: Record<string, unknown> = {}) => {
        fetchHotels({
            city: (overrides.city ?? searchCity) as string || undefined,
            maxPrice: ((overrides.maxPrice ?? maxPrice) as number) < 500000
                ? (overrides.maxPrice ?? maxPrice) as number
                : undefined,
            stars: ((overrides.stars ?? filterStars) as number) > 0
                ? (overrides.stars ?? filterStars) as number
                : undefined,
            checkIn: checkIn || undefined,
            checkOut: checkOut || undefined,
            guests,
            rooms,
            page: (overrides.page ?? 1) as number,
            pageSize: PAGE_SIZE,
            sortBy: ((overrides.sortBy ?? sortBy) as string) || undefined,
            propertyType: ((overrides.propertyType ?? filterPropertyType) as string) || undefined,
        });
    }, [searchCity, maxPrice, filterStars, checkIn, checkOut, guests, rooms, sortBy, filterPropertyType, fetchHotels]);

    // Первая загрузка 
    useEffect(() => {
        search();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Обработчики
    const handleReset = () => {
        setSearchCity('');
        setMaxPrice(500000);
        setFilterStars(0);
        setCheckIn('');
        setCheckOut('');
        setGuests(2);
        setRooms(1);
        setSortBy('');
        setFilterPropertyType('');
        setShowFilters(false);
        fetchHotels({ page: 1, pageSize: PAGE_SIZE, guests: 2, rooms: 1 });
    };

    const handleStarsFilter = (star: number) => {
        const newVal = filterStars === star ? 0 : star;
        setFilterStars(newVal);
        setShowFilters(false);
        search({ stars: newVal });
    };

    const handlePriceChange = (val: number) => {
        setMaxPrice(val);
        if (priceTimer) clearTimeout(priceTimer);
        const timer = setTimeout(() => search({ maxPrice: val }), 500);
        setPriceTimer(timer);
    };

    const activeFiltersCount = (filterStars > 0 ? 1 : 0) + (maxPrice < 500000 ? 1 : 0);

    return (
        <>
            {/*  ГЕРОБЛОК  */}
            <div className="bg-[#003580] pb-8 pt-6 lg:pb-16 lg:pt-8">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Отели в Казахстане</h2>
                    <p className="text-blue-200 mb-4 lg:mb-6 text-sm">Найдите идеальное жильё для вашей поездки</p>

                    <div className="bg-[#febb02] p-1 rounded-lg w-full">
                        <div className="bg-white rounded-md flex flex-col md:flex-row">

                            {/* Город */}
                            <div className="flex items-center gap-2 px-3 py-3 flex-1 border-b md:border-b-0 md:border-r border-gray-200">
                                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Куда вы хотите поехать?"
                                    className="outline-none text-sm w-full text-gray-700 placeholder-gray-400 font-semibold"
                                    value={searchCity}
                                    onChange={e => setSearchCity(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && search()}
                                />
                            </div>

                            {/* Даты */}
                            <div className="flex items-center gap-2 px-3 py-3 flex-1 border-b md:border-b-0 md:border-r border-gray-200 min-w-[220px]">
                                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div className="w-full">
                                    <p className="text-xs text-gray-400 mb-0.5">Даты заезда — выезда</p>
                                    <DatePicker
                                        selectsRange
                                        startDate={parseStringToDate(checkIn)}
                                        endDate={parseStringToDate(checkOut)}
                                        onChange={([start, end]) => {
                                            setCheckIn(formatDateToString(start));
                                            setCheckOut(formatDateToString(end));
                                        }}
                                        minDate={new Date()}
                                        locale={ru}
                                        dateFormat="dd.MM.yyyy"
                                        isClearable
                                        placeholderText="Выберите период"
                                        className="outline-none text-sm w-full font-semibold text-gray-800 bg-transparent cursor-pointer placeholder-gray-400"
                                        wrapperClassName="w-full"
                                        monthsShown={window.innerWidth >= 768 ? 2 : 1}
                                        withPortal={window.innerWidth < 768}
                                    />
                                </div>
                            </div>

                            {/* Гости */}
                            <div className="flex flex-1">
                                <div
                                    ref={guestMenuRef}
                                    className="relative flex items-center gap-2 px-3 py-3 flex-1 cursor-pointer border-r border-gray-200 hover:bg-gray-50 transition"
                                    onClick={() => setIsGuestMenuOpen(prev => !prev)}
                                >
                                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs text-gray-400">Гости</p>
                                        <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">
                                            {guests} взр · {getRoomsText(rooms)}
                                        </p>
                                    </div>

                                    {isGuestMenuOpen && (
                                        <div
                                            className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border p-5 z-50"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {[
                                                { label: 'Взрослые', value: guests, min: 1, set: setGuests },
                                                { label: 'Номера', value: rooms, min: 1, set: setRooms },
                                            ].map(({ label, value, min, set }) => (
                                                <div key={label} className="flex justify-between items-center mb-5 last:mb-0">
                                                    <p className="font-bold text-gray-800">{label}</p>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => set(v => Math.max(min, v - 1))} disabled={value <= min} className="w-9 h-9 rounded border border-[#0071c2] text-[#0071c2] font-bold text-xl flex items-center justify-center hover:bg-blue-50 disabled:opacity-30 transition">−</button>
                                                        <span className="font-semibold w-5 text-center">{value}</span>
                                                        <button onClick={() => set(v => v + 1)} className="w-9 h-9 rounded border border-[#0071c2] text-[#0071c2] font-bold text-xl flex items-center justify-center hover:bg-blue-50 transition">+</button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => setIsGuestMenuOpen(false)} className="w-full mt-4 border border-[#0071c2] text-[#0071c2] font-bold py-2 rounded hover:bg-blue-50 transition">Готово</button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => search()}
                                    className="bg-[#0071c2] hover:bg-[#005999] text-white font-bold px-6 py-3 rounded-br-md md:rounded-r-md md:rounded-br-none transition text-sm whitespace-nowrap"
                                >
                                    Найти
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*  ВКЛАДКИ ТИПОВ  */}
            <div className="bg-white border-b shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto py-2">
                        {PROPERTY_TYPE_TABS.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => {
                                    setFilterPropertyType(tab.value);
                                    search({ propertyType: tab.value });
                                }}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition ${
                                    filterPropertyType === tab.value
                                        ? 'bg-[#003580] text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/*  КОНТЕНТ  */}
            <div className="container mx-auto px-4 py-4 md:py-8">

                {/* Мобильная шапка */}
                <div className="flex justify-between items-center mb-4 lg:hidden">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">
                            {searchCity ? `"${searchCity}"` : 'Все отели'}
                        </h2>
                        <p className="text-xs text-gray-400">{totalCount} вариантов</p>
                    </div>
                    <button
                        onClick={() => setShowFilters(true)}
                        className="relative flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm"
                    >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        <span className="text-gray-700 font-medium">Фильтры</span>
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#0071c2] text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Затемнение фона */}
                {showFilters && (
                    <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)} />
                )}

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── ФИЛЬТРЫ (drawer на мобиле, sidebar на ПК) ─────────── */}
                    <aside className={`
                        lg:w-64 lg:shrink-0 lg:static lg:z-auto
                        fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto
                        bg-white rounded-t-2xl shadow-2xl
                        transition-transform duration-300
                        ${showFilters ? 'translate-y-0' : 'translate-y-full'}
                        lg:translate-y-0 lg:rounded-none lg:shadow-none lg:max-h-none
                    `}>
                        {/* Ручка на мобиле */}
                        <div className="lg:hidden flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>
                        <div className="flex justify-between items-center px-4 pt-3 pb-2 lg:hidden">
                            <h3 className="font-bold text-lg text-gray-800">Фильтры</h3>
                            <button onClick={() => setShowFilters(false)} className="text-gray-400 p-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-white rounded-lg lg:shadow-sm lg:border p-4">
                            <h3 className="font-bold text-gray-800 mb-4 hidden lg:block">Фильтры</h3>

                            {/* Цена */}
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-gray-700 mb-3">
                                    Цена за ночь до: <span className="text-blue-600">{maxPrice.toLocaleString()} ₸</span>
                                </p>
                                <input
                                    type="range" min={1000} max={500000} step={1000} value={maxPrice}
                                    onChange={e => handlePriceChange(Number(e.target.value))}
                                    className="w-full accent-blue-600 h-2"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>1 000 ₸</span><span>500 000 ₸</span>
                                </div>
                            </div>

                            {/* Звёзды */}
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Звёзды</p>
                                <div className="flex flex-col gap-2">
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => handleStarsFilter(star)}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition ${
                                                filterStars === star
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-yellow-400">{'★'.repeat(star)}{'☆'.repeat(5 - star)}</span>
                                            <span>{star} звезды</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleReset} className="w-full text-sm text-blue-600 border border-blue-200 rounded-lg py-2.5 hover:bg-blue-50 transition">
                                Сбросить фильтры
                            </button>
                            <button onClick={() => setShowFilters(false)} className="lg:hidden w-full bg-[#003580] text-white font-bold py-3 rounded-lg mt-3">
                                Показать {totalCount} вариантов
                            </button>
                        </div>
                    </aside>

                    {/* СПИСОК ОТЕЛЕЙ */}
                    <div className="flex-1">
                        {/* Заголовок + сортировка */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="hidden lg:block text-xl font-bold text-gray-800">
                                {searchCity ? `Отели в "${searchCity}"` : 'Все отели Казахстана'}
                                <span className="text-sm font-normal text-gray-500 ml-2">{totalCount} вариантов</span>
                            </h2>
                            <select
                                value={sortBy}
                                onChange={e => { setSortBy(e.target.value); search({ sortBy: e.target.value }); }}
                                className="w-full lg:w-auto text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
                            >
                                <option value="">Сортировка: по умолчанию</option>
                                <option value="price_asc">Цена: сначала дешевле</option>
                                <option value="price_desc">Цена: сначала дороже</option>
                                <option value="stars_desc">Звёзды: 5 → 1</option>
                                <option value="stars_asc">Звёзды: 1 → 5</option>
                            </select>
                        </div>

                        {hotels.length === 0 ? (
                            <div className="bg-white rounded-lg border p-12 text-center">
                                <p className="text-gray-400 text-lg">Ничего не найдено</p>
                                <p className="text-gray-400 text-sm mt-1">Попробуйте изменить фильтры</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {hotels.map((h: Hotel) => (
                                    <HotelCard key={h.id} hotel={h} checkIn={checkIn} checkOut={checkOut} guests={guests} />
                                ))}
                            </div>
                        )}

                        {/* Пагинация */}
                        {totalPages > 1 && (
                            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={() => search({ page: currentPage - 1 })}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 rounded border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
                                >← Назад</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => search({ page: p })}
                                        className={`w-9 h-9 rounded border text-sm font-medium transition ${currentPage === p ? 'bg-[#003580] text-white border-[#003580]' : 'hover:bg-gray-50'}`}
                                    >{p}</button>
                                ))}
                                <button
                                    onClick={() => search({ page: currentPage + 1 })}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 rounded border text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
                                >Вперёд →</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}