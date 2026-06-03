interface AmenitiesSelectorProps {
    options: string[];          // Список всех доступных удобств
    selectedAmenities: string;  // Строка с уже выбранными (через запятую)
    onChange: (newValue: string) => void; // Функция для обновления стейта
}

export default function AmenitiesSelector({ options, selectedAmenities, onChange }: AmenitiesSelectorProps) {
    // Превращаем строку "Wi-Fi, Парковка" обратно в массив ['Wi-Fi', 'Парковка']
    const currentList = selectedAmenities
        ? selectedAmenities.split(',').map(a => a.trim()).filter(Boolean)
        : [];

    const toggleAmenity = (amenity: string) => {
        const isSelected = currentList.includes(amenity);

        // Если уже выбрано — удаляем, если нет — добавляем
        const updatedList = isSelected
            ? currentList.filter(a => a !== amenity)
            : [...currentList, amenity];

        // Склеиваем обратно в строку и отдаем наверх
        onChange(updatedList.join(', '));
    };

    return (
        <div className="flex flex-wrap gap-2">
            {options.map(amenity => {
                const isSelected = currentList.includes(amenity);
                return (
                    <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition ${
                            isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'border-gray-300 hover:border-blue-400 text-gray-600'
                        }`}
                    >
                        {amenity}
                    </button>
                );
            })}
        </div>
    );
}