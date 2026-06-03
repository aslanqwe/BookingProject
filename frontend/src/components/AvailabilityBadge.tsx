import { useEffect, useState } from 'react';
import { hotelsApi } from '../api/hotels';

interface Props {
    hotelId: number;
    checkIn: string;
    checkOut: string;
}

interface Availability {
    totalRooms: number;
    bookedRooms: number;
    availableRooms: number;
    isAvailable: boolean;
}

export default function AvailabilityBadge({ hotelId, checkIn, checkOut }: Props) {
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!checkIn || !checkOut) {
            setAvailability(null);
            return;
        }

        setLoading(true);
        hotelsApi.checkAvailability(hotelId, checkIn, checkOut)
            .then(data => setAvailability(data))
            .catch(() => setAvailability(null))
            .finally(() => setLoading(false));
    }, [hotelId, checkIn, checkOut]);

    if (!checkIn || !checkOut) return null;
    if (loading) return <span className="text-xs text-gray-400">Проверяем...</span>;
    if (!availability) return null;

    if (!availability.isAvailable) {
        return (
            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
                ❌ Нет свободных номеров
            </span>
        );
    }

    return (
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
            availability.availableRooms <= 3
                ? 'text-orange-600 bg-orange-50 border-orange-200'
                : 'text-green-600 bg-green-50 border-green-200'
        }`}>
            {availability.availableRooms <= 3
                ? `⚡ Осталось ${availability.availableRooms} номера!`
                : `✓ Свободно ${availability.availableRooms} из ${availability.totalRooms}`}
        </span>
    );
}