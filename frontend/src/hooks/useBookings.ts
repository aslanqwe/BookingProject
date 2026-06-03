import { useState, useCallback } from 'react';
import { bookingsApi } from '../api/bookings';

export function useBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMyBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await bookingsApi.getMyBookings();
            setBookings(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Не удалось загрузить бронирования');
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelBooking = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите отменить бронь?')) return;

        try {
            await bookingsApi.cancelBooking(id);
            await fetchMyBookings(); // Сразу обновляем список после отмены
        } catch (err: any) {
            alert(err.response?.data?.message || 'Ошибка при отмене');
        }
    };

    return { bookings, loading, error, fetchMyBookings, cancelBooking };
}