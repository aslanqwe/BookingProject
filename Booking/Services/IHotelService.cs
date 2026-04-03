using Booking.DTOs;

namespace Booking.Services;

public interface IHotelService
{
    Task<IEnumerable<HotelDto>> GetAllAsync(string? city, decimal? maxPrice);
    Task<HotelDto> CreateAsync(HotelDto dto, string ownerId);
}