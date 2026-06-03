import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelsApi } from '../api/hotels';
import HotelPage from '../pages/HotelPage';
import type { Hotel } from '../types';

// Интерфейс пропсов полностью удален, так как компонент теперь самостоятельный

export default function HotelPageWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        // Запрашиваем отель напрямую с бэкенда по ID из URL
        hotelsApi.getHotelById(Number(id))
            .then(data => setHotel(data))
            .catch((err) => {
                console.error('Ошибка при загрузке отеля:', err);
                navigate('/'); // Если отель не найден или удален, кидаем на главную
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!hotel) return null;

    return (
        <HotelPage
            hotel={hotel}
            checkIn=""       // Оставляем пустым, юзер выберет даты на странице отеля
            checkOut=""
            guests={2}       // Значение по умолчанию
            onBack={() => navigate('/')}
            onBookingSuccess={() => navigate('/my-bookings')} // После успеха можно кинуть в бронирования
        />
    );
}