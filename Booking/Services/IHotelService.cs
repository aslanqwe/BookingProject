using Booking.DTOs;

namespace Booking.Services;

public interface IHotelService
{
    Task<(IEnumerable<HotelDto> Hotels, int TotalCount)> GetAllAsync(string? city, decimal? maxPrice, int? stars, int page, int pageSize);
    Task<HotelDto> CreateAsync(HotelDto dto, string ownerId);
}