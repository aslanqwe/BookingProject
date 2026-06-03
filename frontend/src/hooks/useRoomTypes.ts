import { useState, useCallback } from 'react';
import { hotelsApi } from '../api/hotels';
import type { RoomType } from '../types';

export function useRoomTypes(hotelId: number) {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoomTypes = useCallback(async (checkIn?: string, checkOut?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: { checkIn?: string; checkOut?: string } = {};
            if (checkIn) params.checkIn = checkIn;
            if (checkOut) params.checkOut = checkOut;

            const data = await hotelsApi.getRoomTypes(hotelId, params);
            setRoomTypes(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Ошибка при загрузке номеров';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [hotelId]);

    return { roomTypes, loading, error, fetchRoomTypes };
}