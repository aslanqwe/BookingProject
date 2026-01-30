using Booking.DTOs;

namespace Booking.Services;

public interface IHotelService
{
    Task<IEnumerable<HotelDto>> GetAllAsync();
    Task<HotelDto> CreateAsync(HotelDto dto, string ownerId);
}