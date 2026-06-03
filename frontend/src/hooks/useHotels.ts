import { useState, useCallback } from 'react';
import { hotelsApi } from '../api/hotels';
import { type Hotel } from '../components/HotelCard';

export interface HotelSearchParams {
    city?: string;
    maxPrice?: number;
    stars?: number;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    propertyType?: string;
}

interface HotelsState {
    hotels: Hotel[];
    totalPages: number;
    totalCount: number;
    currentPage: number;
    loading: boolean;
    error: string | null;
}

export function useHotels() {
    const [state, setState] = useState<HotelsState>({
        hotels: [],
        totalPages: 1,
        totalCount: 0,
        currentPage: 1,
        loading: false,
        error: null,
    });

    const fetchHotels = useCallback(async (params: HotelSearchParams = {}) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const data = await hotelsApi.getHotels(params);
            setState({
                hotels: data.hotels,
                totalPages: data.totalPages,
                totalCount: data.totalCount,
                currentPage: data.currentPage,
                loading: false,
                error: null,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Ошибка при загрузке отелей';
            setState(prev => ({ ...prev, loading: false, error: message }));
        }
    }, []);

    return { ...state, fetchHotels };
}