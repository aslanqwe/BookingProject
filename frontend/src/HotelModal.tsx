import React from 'react';

// Твой интерфейс из App.tsx
interface Hotel {
    id: number;
    name: string;
    city: string;
    pricePerNight: number;
    description?: string;
}

interface HotelModalProps {
    hotel: Hotel | null;
    onClose: () => void;
}

const HotelModal: React.FC<HotelModalProps> = ({ hotel, onClose }) => {
    // Если отель не выбран, компонент вообще ничего не рендерит
    if (!hotel) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden relative animate-in fade-in zoom-in duration-200">

                {/* Кнопка закрытия (крестик) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 bg-white rounded-full p-1 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Заглушка под фото */}
                <div className="h-64 bg-blue-100 flex items-center justify-center relative">
                    <span className="text-blue-300 font-bold text-4xl opacity-50">{hotel.name}</span>
                    <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                        {hotel.city}
                    </div>
                </div>

                <div className="p-6 text-left">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Цена за ночь</p>
                            <p className="text-xl font-bold text-blue-700">{hotel.pricePerNight.toLocaleString()} ₸</p>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {hotel.description && hotel.description.trim() !== ""
                            ? hotel.description
                            : "У этого отеля пока нет детального описания, но он определенно заслуживает вашего внимания."}
                    </p>

                    <div className="border-t pt-6 flex gap-3">
                        <button
                            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-200"
                            onClick={() => alert('Бронирование скоро будет доступно!')}
                        >
                            Забронировать
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelModal;