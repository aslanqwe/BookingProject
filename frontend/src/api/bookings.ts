import axios from 'axios';
import type { Booking, CreateBookingDto } from '../types';

export const bookingsApi = {
    createBooking: async (data: CreateBookingDto): Promise<Booking> => {
        const res = await axios.post('/api/bookings', data);
        return res.data;
    },
    getMyBookings: async (): Promise<Booking[]> => {
        const res = await axios.get('/api/bookings/my');
        return res.data;
    },
    getOwnerBookings: async (): Promise<Booking[]> => {
        const res = await axios.get('/api/bookings/owner');
        return res.data;
    },
    cancelBooking: async (bookingId: number): Promise<void> => {
        await axios.post(`/api/bookings/${bookingId}/cancel`);
    },
};