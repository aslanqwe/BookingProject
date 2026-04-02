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
        pricePerNight: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post("/api/hotels", {
                name: formData.name,
                city: formData.city,
                description: formData.description,
                pricePerNight: formData.pricePerNight
            });

            alert('Отель успешно добавлен!');
            onSuccess();
        } catch (err: any) {
            console.error('Ошибка при добавлении: ', err);
            const message = err.response?.status === 403
                ? "У вас нет прав (нужна роль Owner)"
                : "Не удалось добавить отель";
            alert(message);
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Добавить новый объект</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Название отеля</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border rounded p-2"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Город</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border rounded p-2"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Описание</label>
                    <textarea
                        className="mt-1 block w-full border rounded p-2"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Цена за ночь (₸)</label>
                    <input
                        type="number"
                        className="mt-1 block w-full border rounded p-2"
                        value={formData.pricePerNight}
                        onChange={(e) => setFormData({...formData, pricePerNight: Number(e.target.value)})}
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
                    Опубликовать
                </button>
            </form>
        </div>
    );
}