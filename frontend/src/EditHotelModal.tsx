import { useState, useEffect } from "react";
import axios from "axios";

interface Hotel {
    id: number;
    name: string;
    city: string;
    pricePerNight: number;
    description?: string;
    stars: number;
    totalRooms: number;
    imageUrl?: string;
}

interface EditHotelModalProps {
    hotel: Hotel | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditHotelModal({ hotel, onClose, onSuccess }: EditHotelModalProps) {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Заполняем форму данными отеля при открытии
    useEffect(() => {
        if (hotel) {
            setFormData({
                name: hotel.name,
                city: hotel.city,
                description: hotel.description || '',
                pricePerNight: hotel.pricePerNight,
                stars: hotel.stars,
                totalRooms: hotel.totalRooms,
                imageUrl: hotel.imageUrl || ''
            });
            setImagePreview(hotel.imageUrl || null);
            setError('');
        }
    }, [hotel?.id]);

    if (!hotel) return null;

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
        setLoading(true);
        setError('');

        try {
            await axios.put(`/api/hotels/${hotel.id}`, formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при сохранении');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden relative max-h-[90vh] overflow-y-auto">

                {/* Кнопка закрытия */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 bg-white rounded-full p-1 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">Редактировать отель</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Фото */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Фото отеля</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img src={imagePreview.startsWith('blob') ? imagePreview : imagePreview} alt="preview" className="w-full h-48 object-cover" />
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
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                            <textarea
                                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Цена за ночь (₸)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                    value={formData.pricePerNight}
                                    onChange={e => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
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
                                    onChange={e => setFormData({ ...formData, totalRooms: Number(e.target.value) })}
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
                                        onClick={() => setFormData({ ...formData, stars: star })}
                                        className={`text-2xl transition ${star <= formData.stars ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >★</button>
                                ))}
                                <span className="text-sm text-gray-500 self-center ml-2">{formData.stars} звезды</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Сохраняем...' : 'Сохранить изменения'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}