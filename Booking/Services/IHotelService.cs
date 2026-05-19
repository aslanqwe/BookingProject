using Booking.DTOs;

namespace Booking.Services;

public interface IHotelService
{
    Task<(IEnumerable<HotelDto> Hotels, int TotalCount)> GetAllAsync(string? city,
        decimal? maxPrice,
        int? stars,
        DateOnly? checkIn,
        DateOnly? checkOut,
        int? guests,
        int? roomsCount,
        int page,
        int pageSize,
        string? sortBy,
        string? propertyType = null);
        
    Task<HotelDto?> GetByIdAsync(int id);
    Task<HotelDto> CreateAsync(HotelDto dto, string ownerId);
    Task<HotelDto?> UpdateAsync(int id, HotelDto dto, string ownerId);
    Task<bool> DeleteAsync(int id, string ownerId);
}