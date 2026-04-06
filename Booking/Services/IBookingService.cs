using Booking.DTOs;

namespace Booking.Services;

public interface IBookingService
{
    Task<BookingDto> CreateAsync(CreateBookingDto dto, string userId);
    Task<IEnumerable<BookingDto>> GetMyBookingsAsync(string userId);
    Task CancelAsync(int bookingId, string userId);
}