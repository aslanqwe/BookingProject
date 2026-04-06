import { useState } from "react";
import axios from "axios";

interface AddHotelProps {
    onSuccess: () => void;
    ownerEmail: string;
}

export default function AddHotel({ onSuccess, ownerEmail }: AddHotelProps) {
    const [formData, setFormData] = useState({
        name: "",
        city: "",
        description: "",
        pricePerNight: 0,
        stars: 3,
        totalRooms: 10
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("/api/hotels", formData);
            alert('Отель успешно добавлен!');
            onSuccess();
        } catch (err: any) {
            const message = err.response?.status === 403
                ? "У вас нет прав (нужна роль Owner)"
                : "Не удалось добавить отель";
            alert(message);
        }
    }

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Добавить новый объект</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Название отеля</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                    <textarea
                        className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Цена за ночь (₸)</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                            value={formData.pricePerNight}
                            onChange={(e) => setFormData({...formData, pricePerNight: Number(e.target.value)})}
                            required
                            min={0}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Количество номеров</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                            value={formData.totalRooms}
                            onChange={(e) => setFormData({...formData, totalRooms: Number(e.target.value)})}
                            required
                            min={1}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Звёзды</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setFormData({...formData, stars: star})}
                                className={`text-2xl transition ${star <= formData.stars ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                ★
                            </button>
                        ))}
                        <span className="text-sm text-gray-500 self-center ml-2">{formData.stars} звезды</span>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                    <p>Владелец: <span className="font-medium">{ownerEmail}</span></p>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                >
                    Опубликовать
                </button>
            </form>
        </div>
    );
}