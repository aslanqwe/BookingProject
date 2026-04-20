using Booking.DTOs;

namespace Booking.Services;

public interface IHotelService
{
    Task<(IEnumerable<HotelDto> Hotels, int TotalCount)> GetAllAsync(string? city, decimal? maxPrice, int? stars, int page, int pageSize, string? sortBy);
    Task<HotelDto> CreateAsync(HotelDto dto, string ownerId);
    Task<HotelDto?> UpdateAsync(int id, HotelDto dto, string ownerId);
}