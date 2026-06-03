import { useState, useCallback } from 'react';
import { bookingsApi } from '../api/bookings';
import { hotelsApi } from '../api/hotels';

export function useOwnerData() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [myHotels, setMyHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [bookingsRes, hotelsRes] = await Promise.all([
                bookingsApi.getOwnerBookings(),
                hotelsApi.getOwnerHotels()
            ]);

            setBookings(bookingsRes);
            setMyHotels(hotelsRes);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при загрузке данных');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteHotel = async (hotelId: number, hotelName: string) => {
        if (!window.confirm(`Удалить "${hotelName}"? Все брони сохранятся в истории.`)) return;

        try {
            await hotelsApi.deleteHotel(hotelId);
            await fetchData(); 
        } catch (err: any) {
            alert(err.response?.data?.message || 'Ошибка при удалении');
        }
    };

    return { bookings, myHotels, loading, error, fetchData, deleteHotel };
}