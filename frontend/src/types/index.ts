// Пользователь 
export interface User {
    email: string;
    role: string;
}

// Отель 
export interface Hotel {
    id: number;
    name: string;
    city: string;
    address?: string;
    pricePerNight: number;
    description?: string;
    stars: number;
    totalRooms: number;
    images: string[];
    propertyType: string;
    hotelAmenities?: string;
}

//  Тип номера 
export interface RoomType {
    id: number;
    hotelId: number;
    name: string;
    description?: string;
    pricePerNight: number;
    totalRooms: number;
    maxGuests: number;
    amenities?: string;
    imageUrl?: string;
    availableRooms: number;
}

//  Бронирование 
export interface Booking {
    id: number;
    hotelId: number;
    hotelName: string;
    city: string;
    roomTypeId?: number;
    roomTypeName?: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    specialRequests?: string;
}

export interface CreateBookingDto {
    hotelId: number;
    roomTypeId?: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    specialRequests?: string;
}

// Параметры поиска отелей 
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

export interface HotelsResponse {
    hotels: Hotel[];
    totalPages: number;
    totalCount: number;
    currentPage: number;
}