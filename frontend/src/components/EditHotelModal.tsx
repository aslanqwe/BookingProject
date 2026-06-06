import { useState, useEffect } from 'react';
import { hotelsApi } from '../api/hotels';
import AmenitiesSelector from './AmenitiesSelector';
import type { Hotel } from '../types';

interface EditHotelModalProps {
    hotel: Hotel | null;
    onClose: () => void;
    onSuccess: () => void;
}

const PROPERTY_TYPES = ['Отель', 'Апартаменты', 'Хостел', 'Гостевой дом', 'Вилла'];
const HOTEL_AMENITIES = [
    'Бесплатный Wi-Fi', 'Парковка', 'Бассейн', 'Ресторан',
    'Спа', 'Фитнес-зал', 'Конференц-зал', 'Трансфер из аэропорта',
    'Завтрак включён', 'Кондиционер', 'Лифт', 'Круглосуточная стойка регистрации',
];

interface FormData {
    name: string; city: string; address: string; description: string;
    pricePerNight: number; stars: number; propertyType: string; hotelAmenities: string;
}

const EMPTY_FORM: FormData = {
    name: '', city: '', address: '', description: '',
    pricePerNight: 0, stars: 3, propertyType: 'Отель', hotelAmenities: '',
};

const MAX_PHOTOS = 15;

export default function EditHotelModal({ hotel, onClose, onSuccess }: EditHotelModalProps) {
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
    const [photos, setPhotos] = useState<string[]>([]); // 🔥 Массив текущих фото
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (hotel) {
            setFormData({
                name: hotel.name,
                city: hotel.city,
                address: hotel.address ?? '',
                description: hotel.description ?? '',
                pricePerNight: hotel.pricePerNight,
                stars: hotel.stars,
                propertyType: hotel.propertyType ?? 'Отель',
                hotelAmenities: hotel.hotelAmenities ?? '',
            });

            // Вытаскиваем фотки из старого (строка) или нового (массив) типа
            const rawUrl = hotel.imageUrl || (hotel.images ? hotel.images.join(',') : '');
            setPhotos(rawUrl ? rawUrl.split(',').map(s => s.trim()).filter(Boolean) : []);
            setError('');
        }
    }, [hotel]);

    if (!hotel) return null;

    // Загрузка множества фото
    const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (photos.length + files.length > MAX_PHOTOS) {
            alert(`Максимум ${MAX_PHOTOS} фото.`);
            return;
        }

        setUploading(true);
        try {
            const uploadPromises = files.map(file => hotelsApi.uploadImage(file));
            const results = await Promise.all(uploadPromises);
            const newUrls = results.map(res => res.imageUrl);
            setPhotos(prev => [...prev, ...newUrls]);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Ошибка загрузки фото';
            alert(msg);
        } finally {
            setUploading(false);
            e.target.value = ''; // сброс input
        }
    };

    const removePhoto = (indexToRemove: number) => {
        setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Отправляем данные + склеиваем фото обратно в строку для бэкенда
            const payload = {
                ...formData,
                images: photos
            };

            await hotelsApi.updateHotel(hotel.id, payload as any);
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Ошибка при сохранении';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const set = (field: keyof FormData, value: string | number) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 bg-white rounded-full p-1 shadow-md">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">Редактировать объект</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Тип объекта */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Тип объекта</label>
                            <select
                                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                                value={formData.propertyType}
                                onChange={e => set('propertyType', e.target.value)}
                            >
                                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Галерея фотографий (Множественная загрузка) */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-sm font-medium text-gray-700">Фотографии объекта</label>
                                <span className="text-xs text-gray-400">{photos.length} / {MAX_PHOTOS}</span>
                            </div>

                            {photos.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {photos.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            {idx === photos.length - 1 && (
                                                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Главное</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {photos.length < MAX_PHOTOS && (
                                <label className="flex items-center justify-center h-16 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                    {uploading ? (
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="text-sm font-medium text-blue-600">+ Загрузить фото</span>
                                    )}
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleMultipleImageUpload} disabled={uploading} />
                                </label>
                            )}
                        </div>

                        {/* Название */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                            <input type="text" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                   value={formData.name} onChange={e => set('name', e.target.value)} required />
                        </div>

                        {/* Город + Адрес */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                                <input type="text" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                       value={formData.city} onChange={e => set('city', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                                <input type="text" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                       value={formData.address} onChange={e => set('address', e.target.value)} />
                            </div>
                        </div>

                        {/* Описание */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                            <textarea className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                                      value={formData.description} onChange={e => set('description', e.target.value)} />
                        </div>

                        {/* Звёзды */}
                        {formData.propertyType !== 'Апартаменты' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Звёзды</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} type="button" onClick={() => set('stars', star)}
                                                className={`text-2xl transition ${star <= formData.stars ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Удобства */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Удобства отеля</label>
                            <AmenitiesSelector
                                options={HOTEL_AMENITIES}
                                selectedAmenities={formData.hotelAmenities}
                                onChange={val => set('hotelAmenities', val)}
                            />
                        </div>

                        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">{error}</div>}

                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={loading || uploading}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">
                                {loading ? 'Сохраняем...' : 'Сохранить'}
                            </button>
                            <button type="button" onClick={onClose}
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition">Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}