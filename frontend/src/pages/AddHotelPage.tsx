import { useHotelForm } from '../hooks/useHotelForm';
import AmenitiesSelector from '../components/AmenitiesSelector';

interface AddHotelPageProps {
    onSuccess: () => void;
    ownerEmail: string;
}

const PROPERTY_TYPES = [
    { value: 'Отель',        label: '🏨 Отель',        desc: 'Гостиница с номерным фондом' },
    { value: 'Апартаменты',  label: '🏢 Апартаменты',  desc: 'Квартира посуточно' },
    { value: 'Хостел',       label: '🛏 Хостел',       desc: 'Бюджетное размещение' },
    { value: 'Гостевой дом', label: '🏠 Гостевой дом', desc: 'Частный дом для гостей' },
    { value: 'Вилла',        label: '🌴 Вилла',        desc: 'Отдельная вилла или коттедж' },
];

const HOTEL_AMENITIES = [
    'Бесплатный Wi-Fi', 'Парковка', 'Бассейн', 'Ресторан',
    'Спа', 'Фитнес-зал', 'Конференц-зал', 'Трансфер из аэропорта',
    'Завтрак включён', 'Кондиционер', 'Лифт', 'Круглосуточная стойка регистрации',
];

export default function AddHotelPage({ onSuccess }: AddHotelPageProps) {
    const {
        formData, previews, uploading, submitting, step,
        setField, uploadImages, removeImage, submit, selectType, goBack,
        MAX_IMAGES,
    } = useHotelForm(onSuccess);

    if (step === 'type') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Добавить объект размещения</h2>
                <p className="text-gray-500 mb-8">Что вы хотите разместить?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROPERTY_TYPES.map(type => (
                        <button
                            key={type.value}
                            onClick={() => selectType(type.value)}
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

    const currentType = PROPERTY_TYPES.find(t => t.value === formData.propertyType);

    return (
        <div className="max-w-lg mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-md border p-6">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={goBack} className="text-blue-600 hover:text-blue-800 text-sm">← Назад</button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{currentType?.label}</h2>
                        <p className="text-xs text-gray-500">Заполните информацию об объекте</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Фотографии */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Фото объекта
                            <span className="text-gray-400 font-normal ml-1">({previews.length}/{MAX_IMAGES})</span>
                        </label>
                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                                {previews.map((src, i) => (
                                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >✕</button>
                                        {i === 0 && (
                                            <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">Главное</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {previews.length < MAX_IMAGES && (
                            <label className={`flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                {uploading
                                    ? <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    : <span className="text-2xl">📷</span>
                                }
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{uploading ? 'Загружаем...' : 'Добавить фото'}</p>
                                    <p className="text-xs text-gray-400">JPG, PNG, WEBP · до 5MB каждое</p>
                                </div>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={uploadImages} disabled={uploading} />
                            </label>
                        )}
                    </div>

                    {/* Название */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Название {formData.propertyType === 'Апартаменты' ? 'квартиры' : 'объекта'}
                        </label>
                        <input type="text"
                               placeholder={formData.propertyType === 'Апартаменты' ? 'Уютная 2-комнатная квартира' : 'Название'}
                               className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                               value={formData.name} onChange={e => setField('name', e.target.value)} required />
                    </div>

                    {/* Город + Адрес */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                            <input type="text" className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                   value={formData.city} onChange={e => setField('city', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                            <input type="text" placeholder="ул. Байтурсынова, 15"
                                   className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                   value={formData.address} onChange={e => setField('address', e.target.value)} />
                        </div>
                    </div>

                    {/* Описание */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                        <textarea className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 h-24 resize-none"
                                  placeholder="Расскажите об объекте..."
                                  value={formData.description} onChange={e => setField('description', e.target.value)} required />
                    </div>

                    {/* Звёзды */}
                    {formData.propertyType !== 'Апартаменты' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                            <div className="flex gap-2 items-center">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} type="button" onClick={() => setField('stars', star)}
                                            className={`text-2xl transition ${star <= formData.stars ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                                ))}
                                <span className="text-sm text-gray-500 ml-2">{formData.stars} звезды</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-600">
                        💡 После создания объекта вы сможете добавить типы номеров в панели владельца
                    </div>

                    {/* Удобства */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Удобства</label>
                        <AmenitiesSelector
                            options={HOTEL_AMENITIES}
                            selectedAmenities={formData.hotelAmenities}
                            onChange={val => setField('hotelAmenities', val)}
                        />
                    </div>

                    <button type="submit" disabled={uploading || submitting}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50">
                        {submitting ? 'Публикуем...' : 'Опубликовать объект'}
                    </button>
                </form>
            </div>
        </div>
    );
}