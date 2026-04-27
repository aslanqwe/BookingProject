import { useEffect, useState } from 'react';
import axios from 'axios';

interface RoomType {
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

interface ManageRoomTypesProps {
    hotelId: number;
    hotelName: string;
    onClose: () => void;
}

const AMENITY_OPTIONS = [
    'Wi-Fi', 'Кондиционер', 'ТВ', 'Холодильник',
    'Ванная', 'Душ', 'Балкон', 'Сейф',
    'Фен', 'Мини-бар', 'Завтрак включён', 'Парковка'
];

const ROOM_TYPE_PRESETS = [
    'Стандартный', 'Улучшенный', 'Люкс', 'Бизнес',
    'Семейный', 'Студия', 'Апартаменты', 'Эконом'
];

export default function ManageRoomTypes({ hotelId, hotelName, onClose }: ManageRoomTypesProps) {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pricePerNight: 0,
        totalRooms: 1,
        maxGuests: 2,
        amenities: [] as string[],
        imageUrl: ''
    });

    const fetchRoomTypes = () => {
        setLoading(true);
        axios.get(`/api/hotels/${hotelId}/roomtypes`)
            .then(res => setRoomTypes(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRoomTypes();
    }, [hotelId]);

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

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await axios.post(`/api/hotels/${hotelId}/roomtypes`, {
                ...formData,
                amenities: formData.amenities.join(', ')
            });
            setFormData({
                name: '', description: '', pricePerNight: 0,
                totalRooms: 1, maxGuests: 2, amenities: [], imageUrl: ''
            });
            setImagePreview(null);
            setShowForm(false);
            fetchRoomTypes();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при сохранении');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить этот тип номера?')) return;
        try {
            await axios.delete(`/api/hotels/${hotelId}/roomtypes/${id}`);
            fetchRoomTypes();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Ошибка при удалении');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

                {/* Шапка */}
                <div className="bg-[#003580] px-6 py-4 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-white font-bold text-lg">Типы номеров</h2>
                        <p className="text-blue-200 text-sm">{hotelName}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-blue-200 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">

                    {/* Список существующих типов */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : roomTypes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-4xl mb-3">🛏</p>
                            <p>Типы номеров не добавлены</p>
                            <p className="text-sm mt-1">Добавьте хотя бы один тип номера</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 mb-6">
                            {roomTypes.map(rt => (
                                <div key={rt.id} className="bg-gray-50 rounded-xl border flex overflow-hidden">
                                    {rt.imageUrl && (
                                        <img src={rt.imageUrl} alt={rt.name} className="w-24 h-24 object-cover shrink-0" />
                                    )}
                                    <div className="flex-1 p-4 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{rt.name}</h4>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                👤 до {rt.maxGuests} гост. · 🛏 {rt.totalRooms} номеров
                                            </p>
                                            <p className="text-sm font-bold text-[#003580] mt-1">
                                                {rt.pricePerNight.toLocaleString()} ₸/ночь
                                            </p>
                                            {rt.amenities && (
                                                <p className="text-xs text-gray-400 mt-1">{rt.amenities}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(rt.id)}
                                            className="text-red-400 hover:text-red-600 text-sm font-medium transition"
                                        >
                                            🗑 Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Кнопка добавить */}
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full border-2 border-dashed border-blue-300 text-blue-600 font-bold py-4 rounded-xl hover:bg-blue-50 transition"
                        >
                            + Добавить тип номера
                        </button>
                    )}

                    {/* Форма добавления */}
                    {showForm && (
                        <form onSubmit={handleSave} className="border-2 border-blue-200 rounded-xl p-5 mt-4">
                            <h3 className="font-bold text-gray-800 mb-4">Новый тип номера</h3>

                            {/* Быстрый выбор названия */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {ROOM_TYPE_PRESETS.map(preset => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, name: preset }))}
                                            className={`text-xs px-3 py-1 rounded-full border transition ${
                                                formData.name === preset
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 hover:border-blue-400'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Или введите своё название"
                                    className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Фото номера */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Фото номера</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="preview" className="w-full h-32 object-cover" />
                                            <button type="button" onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, imageUrl: "" })); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center gap-2 h-16 cursor-pointer hover:bg-gray-50 transition">
                                            {uploading ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> : <><span>📷</span><span className="text-sm text-gray-500">Загрузить фото</span></>}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                                <textarea
                                    className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 h-16 resize-none"
                                    placeholder="Опишите номер..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Цена/ночь (₸)</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Кол-во</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                        value={formData.totalRooms}
                                        onChange={e => setFormData({ ...formData, totalRooms: Number(e.target.value) })}
                                        required
                                        min={1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Макс. гостей</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                        value={formData.maxGuests}
                                        onChange={e => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                                        required
                                        min={1}
                                    />
                                </div>
                            </div>

                            {/* Удобства */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Удобства</label>
                                <div className="flex flex-wrap gap-2">
                                    {AMENITY_OPTIONS.map(amenity => (
                                        <button
                                            key={amenity}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition ${
                                                formData.amenities.includes(amenity)
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 hover:border-blue-400 text-gray-600'
                                            }`}
                                        >
                                            {amenity}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={saving || uploading}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {saving ? 'Сохраняем...' : 'Добавить тип номера'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setError(''); }}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}