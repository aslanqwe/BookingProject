import type { RoomType } from '../types';


export const AMENITY_ICONS: Record<string, string> = {
    'Wi-Fi': '📶', 'WiFi': '📶', 'Завтрак': '🍳',
    'Кондиционер': '❄️', 'Парковка': '🚗', 'Телевизор': '📺',
    'Бассейн': '🏊', 'Кухня': '🍳', 'Фен': '💨',
    'Вид на город': '🏙️', 'Рабочая зона': '💻', 'Кофемашина': '☕',
    'Ванная': '🛁', 'Душ': '🚿', 'Балкон': '🌿',
    'Сейф': '🔒', 'Мини-бар': '🍷', 'Холодильник': '🧊',
    'ТВ': '📺', 'Завтрак включён': '🍳',
};

interface RoomTypeRowProps {
    room: RoomType;
    nights: number;
    isSelected: boolean;
    defaultRooms: number;
    onSelect: (room: RoomType, rooms: number) => void;
}

export default function RoomTypeRow({ room, nights, isSelected, defaultRooms, onSelect }: RoomTypeRowProps) {
    const amenities = room.amenities ? room.amenities.split(',').map(a => a.trim()) : [];
    const isAvailable = room.availableRooms > 0;

    return (
        <tr className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} ${!isAvailable ? 'opacity-50' : ''} transition`}>
            {/* Название + фото + удобства */}
            <td className="px-6 py-5 align-top">
                {room.imageUrl && (
                    <img src={room.imageUrl} alt={room.name} className="w-full h-28 object-cover rounded-lg mb-3" />
                )}
                <p className="font-bold text-blue-700">{room.name}</p>
                {room.description && (
                    <p className="text-xs text-gray-500 mt-1">{room.description}</p>
                )}
                {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {amenities.map(a => (
                            <span key={a} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                {AMENITY_ICONS[a] || '✓'} {a}
                            </span>
                        ))}
                    </div>
                )}
            </td>

            {/* Вместимость */}
            <td className="text-center px-4 py-5 align-top">
                <div className="flex justify-center gap-0.5">
                    {Array.from({ length: Math.min(room.maxGuests, 4) }).map((_, i) => (
                        <span key={i} className="text-sm">👤</span>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">до {room.maxGuests}</p>
            </td>

            {/* Цена */}
            <td className="text-center px-4 py-5 align-top font-semibold text-gray-900">
                {nights > 0
                    ? (room.pricePerNight * nights).toLocaleString()
                    : room.pricePerNight.toLocaleString()} ₸
                {nights > 0 && (
                    <p className="text-xs text-gray-400 font-normal">{room.pricePerNight.toLocaleString()} ₸/ночь</p>
                )}
            </td>

            {/* Доступность */}
            <td className="text-center px-4 py-5 align-top">
                {isAvailable ? (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        room.availableRooms <= 3
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                    }`}>
                        {room.availableRooms <= 3 ? `⚡ Осталось ${room.availableRooms}` : `✓ ${room.availableRooms} своб.`}
                    </span>
                ) : (
                    <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">Занято</span>
                )}
            </td>

            {/* Кнопка выбора */}
            <td className="text-center px-4 py-5 align-top">
                <button
                    disabled={!isAvailable}
                    onClick={() => onSelect(room, defaultRooms)}
                    className={`px-4 py-2 text-xs font-bold rounded transition shadow-sm ${
                        isSelected
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none'
                    }`}
                >
                    {isSelected ? '✓ Выбран' : 'Выбрать'}
                </button>
            </td>
        </tr>
    );
}