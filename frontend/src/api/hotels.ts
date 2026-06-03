import axios from 'axios';
import type { Hotel, HotelSearchParams, HotelsResponse, RoomType } from '../types';

export const hotelsApi = {
    // Публичные
    getHotels: async (params: HotelSearchParams): Promise<HotelsResponse> => {
        const res = await axios.get('/api/hotels', { params });
        return res.data;
    },
    getHotelById: async (id: number): Promise<Hotel> => {
        const res = await axios.get(`/api/hotels/${id}`);
        return res.data;
    },
    checkAvailability: async (hotelId: number, checkIn: string, checkOut: string) => {
        const res = await axios.get(`/api/hotels/${hotelId}/availability`, {
            params: { checkIn, checkOut }
        });
        return res.data as { totalRooms: number; bookedRooms: number; availableRooms: number; isAvailable: boolean };
    },
    getOwnerContact: async (hotelId: number) => {
        const res = await axios.get(`/api/hotels/${hotelId}/owner-contact`);
        return res.data as { phone?: string; email?: string };
    },

    // Владелец
    getOwnerHotels: async (): Promise<Hotel[]> => {
        const res = await axios.get('/api/hotels/my');
        return res.data;
    },
    createHotel: async (data: Partial<Hotel>): Promise<Hotel> => {
        const res = await axios.post('/api/hotels', data);
        return res.data;
    },
    updateHotel: async (id: number, data: Partial<Hotel>): Promise<Hotel> => {
        const res = await axios.put(`/api/hotels/${id}`, data);
        return res.data;
    },
    deleteHotel: async (id: number): Promise<void> => {
        await axios.delete(`/api/hotels/${id}`);
    },

    // Типы номеров
    getRoomTypes: async (hotelId: number, params?: { checkIn?: string; checkOut?: string }): Promise<RoomType[]> => {
        const res = await axios.get(`/api/hotels/${hotelId}/roomtypes`, { params });
        return res.data;
    },
    createRoomType: async (hotelId: number, data: Partial<RoomType>): Promise<RoomType> => {
        const res = await axios.post(`/api/hotels/${hotelId}/roomtypes`, data);
        return res.data;
    },
    deleteRoomType: async (hotelId: number, roomId: number): Promise<void> => {
        await axios.delete(`/api/hotels/${hotelId}/roomtypes/${roomId}`);
    },

    // Загрузка картинок
    uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
        const form = new FormData();
        form.append('file', file);
        const res = await axios.post('/api/upload/image', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },
};