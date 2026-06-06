import { useState } from 'react';
import { hotelsApi } from '../api/hotels';

const MAX_IMAGES = 15;

export interface HotelFormData {
    name: string;
    city: string;
    address: string;
    description: string;
    stars: number;
    propertyType: string;
    hotelAmenities: string;
    images: string[]; // массив URL загруженных фото
}

const EMPTY_FORM: HotelFormData = {
    name: '',
    city: '',
    address: '',
    description: '',
    stars: 3,
    propertyType: '',
    hotelAmenities: '',
    images: [],
};

export function useHotelForm(onSuccess: () => void) {
    const [formData, setFormData] = useState<HotelFormData>(EMPTY_FORM);
    const [previews, setPreviews] = useState<string[]>([]); // локальные blob URL для превью
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'type' | 'details'>('type');

    // Установить одно поле формы
    const setField = <K extends keyof HotelFormData>(field: K, value: HotelFormData[K]) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    // Загрузить фото (несколько за раз)
    const uploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const remaining = MAX_IMAGES - formData.images.length;
        if (remaining <= 0) {
            alert(`Максимум ${MAX_IMAGES} фотографий`);
            return;
        }

        const toUpload = files.slice(0, remaining);
        setUploading(true);
        try {
            const uploaded: string[] = [];
            for (const file of toUpload) {
                const data = await hotelsApi.uploadImage(file);
                uploaded.push(data.imageUrl);
            }

            setFormData(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
            setPreviews(prev => [
                ...prev,
                ...toUpload.map(f => URL.createObjectURL(f)),
            ]);
        } catch {
            alert('Ошибка загрузки фото');
        } finally {
            setUploading(false);
            e.target.value = ''; // сброс input
        }
    };

    // Удалить фото по индексу
    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Сабмит формы
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                imageUrl: formData.images.join(',')
            };

            await hotelsApi.createHotel(payload as any); // Отправляем подготовленный payload

            alert('Объект успешно добавлен!');
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Не удалось добавить объект';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const selectType = (propertyType: string) => {
        setField('propertyType', propertyType);
        setStep('details');
    };

    const goBack = () => setStep('type');

    return {
        formData, previews, uploading, submitting, step,
        setField, uploadImages, removeImage, submit, selectType, goBack,
        MAX_IMAGES,
    };
}