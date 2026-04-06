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
        totalRooms: 10,
        imageUrl: ""
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const form = new FormData();
        form.append("file", file);

        try {
            const res = await axios.post("/api/upload/image", form, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
            setImagePreview(URL.createObjectURL(file));
        } catch (err: any) {
            alert(err.response?.data?.message || "Ошибка загрузки фото");
        } finally {
            setUploading(false);
        }
    };

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

                {/* Фото */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Фото отеля</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, imageUrl: "" })); }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600"
                                >✕</button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 transition">
                                {uploading ? (
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="text-4xl mb-2">🏨</span>
                                        <span className="text-sm text-gray-500">Нажмите чтобы загрузить фото</span>
                                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP до 5MB</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>

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
                            >★</button>
                        ))}
                        <span className="text-sm text-gray-500 self-center ml-2">{formData.stars} звезды</span>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                    <p>Владелец: <span className="font-medium">{ownerEmail}</span></p>
                </div>

                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                    Опубликовать
                </button>
            </form>
        </div>
    );
}