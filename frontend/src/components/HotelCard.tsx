import { useNavigate } from 'react-router-dom';
import AvailabilityBadge from './AvailabilityBadge';
import type { Hotel } from '../types';

interface HotelCardProps {
    hotel: Hotel;
    checkIn: string;
    checkOut: string;
    guests: number;
}

export default function HotelCard({ hotel: h, checkIn, checkOut, guests }: HotelCardProps) {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row overflow-hidden">
            <div className="w-full h-48 sm:w-48 sm:h-auto shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                {h.imageUrl ? (
                    <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-blue-300 font-bold text-lg text-center px-2">{h.name}</span>
                )}
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                        <div>
                            <h3 className="text-lg font-bold text-blue-700">{h.name}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">📍 {h.city}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-yellow-400 text-sm">{'★'.repeat(h.stars)}{'☆'.repeat(5 - h.stars)}</span>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{h.propertyType}</span>
                            </div>
                            {checkIn && checkOut && (
                                <div className="mt-2">
                                    <AvailabilityBadge hotelId={h.id} checkIn={checkIn} checkOut={checkOut} />
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded shrink-0 self-start">
                            {h.totalRooms} номеров
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {h.description?.trim() || 'Описание отсутствует'}
                    </p>
                </div>

                <div className="flex justify-between items-end mt-4 pt-4 border-t sm:border-none border-gray-100">
                    <div>
                        {checkIn && checkOut && (
                            <p className="text-xs text-gray-400">{checkIn} — {checkOut} · {guests} гост.</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                            {h.totalRooms > 0 ? `от ${h.pricePerNight.toLocaleString()} ₸` : 'Цены уточняются'}
                        </p>
                        <button
                            onClick={() => navigate(`/hotels/${h.id}`)}
                            className="bg-[#0071c2] hover:bg-[#005999] text-white text-sm font-bold px-5 py-2 rounded transition w-full sm:w-auto"
                        >
                            Смотреть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}