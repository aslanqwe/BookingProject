import { useState } from 'react';
import { hotelsApi } from '../api/hotels';
import AmenitiesSelector from '../components/AmenitiesSelector';

interface AddHotelProps {
    onSuccess: () => void;
    ownerEmail: string;
}

const PROPERTY_TYPES = [
    { value: 'Отель',       label: '🏨 Отель',       desc: 'Гостиница с номерным фондом' },
    { value: 'Апартаменты', label: '🏢 Апартаменты', desc: 'Квартира посуточно' },
    { value: 'Хостел',      label: '🛏 Хостел',      desc: 'Бюджетное размещение' },
    { value: 'Гостевой дом',label: '🏠 Гостевой дом',desc: 'Частный дом для гостей' },
    { value: 'Вилла',       label: '🌴 Вилла',       desc: 'Отдельная вилла или коттедж' },
];

const HOTEL_AMENITIES = [
    'Бесплатный Wi-Fi', 'Парковка', 'Бассейн', 'Ресторан',
    'Спа', 'Фитнес-зал', 'Конференц-зал', 'Трансфер из аэропорта',
    'Завтрак включён', 'Кондиционер', 'Лифт', 'Круглосуточная стойка регистрации',
];

interface FormData {
    name: string; city: string; address: string; description: string;
    stars: number; imageUrl: string; propertyType: string; hotelAmenities: string;
}

const EMPTY_FORM: FormData = {
    name: '', city: '', address: '', description: '',
    stars: 3, imageUrl: '', propertyType: '', hotelAmenities: '',
};

export default function AddHotelPage({ onSuccess }: AddHotelProps) {
    const [step, setStep] = useState<'type' | 'details'>('type');
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const set = (field: keyof FormData, value: string | number) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const data = await hotelsApi.uploadImage(file);
            set('imageUrl', data.imageUrl);
            setImagePreview(URL.createObjectURL(file));
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Ошибка загрузки фото';
            alert(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await hotelsApi.createHotel(formData);
            alert('Объект успешно добавлен!');
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Не удалось добавить объект';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ШАГ 1 — выбор типа объекта
    if (step === 'type') {
        return (
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Добавить объект размещения</h2>
                <p className="text-gray-500 mb-8">Что вы хотите разместить?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROPERTY_TYPES.map(type => (
                        <button
                            key={type.value}
                            onClick={() => { set('propertyType', type.value); setStep('details'); }}
                            className="bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-6 text-left transition group"
                        >
                            <div className="text-3xl mb-3">{type.label.split(' ')[0]}</div>
                            <h3 className="font-bold text-gray-800 group-hover:text-blue-700">
                                {type.label.split(' ').slice(1).join(' ')}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{type.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // ШАГ 2 — заполнение деталей
    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep('type')} className="text-blue-600 hover:text-blue-800 text-sm">← Назад</button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.label}
                    </h2>
                    <p className="text-xs text-gray-500">Заполните информацию об объекте</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Фото */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Фото объекта</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                                <button type="button"
                                        onClick={() => { setImagePreview(null); set('imageUrl', ''); }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600">✕
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 transition">
                                {uploading
                                    ? <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    : (<><span className="text-4xl mb-2">📷</span><span className="text-sm text-gray-500">Нажмите чтобы загрузить фото</span><span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP до 5MB</span></>)
                                }
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Название */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название {formData.propertyType === 'Апартаменты' ? 'квартиры' : 'объекта'}
                    </label>
                    <input type="text"
                           placeholder={formData.propertyType === 'Апартаменты' ? 'Например: Уютная 2-комнатная квартира' : 'Название'}
                           className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
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
                        <input type="text" placeholder="ул. Байтурсынова, 15"
                               className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                               value={formData.address} onChange={e => set('address', e.target.value)} />
                    </div>
                </div>

                {/* Описание */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                    <textarea className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                              placeholder="Расскажите об объекте..."
                              value={formData.description} onChange={e => set('description', e.target.value)} required />
                </div>

                {/* Звёзды */}
                {formData.propertyType !== 'Апартаменты' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" onClick={() => set('stars', star)}
                                        className={`text-2xl transition ${star <= formData.stars ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                            ))}
                            <span className="text-sm text-gray-500 self-center ml-2">{formData.stars} звезды</span>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-600">
                    <p>💡 После создания объекта вы сможете добавить типы номеров в панели владельца</p>
                </div>

                {/* Удобства */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Удобства</label>
                    <AmenitiesSelector
                        options={HOTEL_AMENITIES}
                        selectedAmenities={formData.hotelAmenities}
                        onChange={val => set('hotelAmenities', val)}
                    />
                </div>

                <button type="submit" disabled={uploading || submitting}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50">
                    {submitting ? 'Публикуем...' : 'Опубликовать объект'}
                </button>
            </form>
        </div>
    );
}