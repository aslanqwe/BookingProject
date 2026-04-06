using Booking.Data;
using Booking.DTOs;
using Booking.Models;
using Microsoft.EntityFrameworkCore;

namespace Booking.Services;

public class BookingService : IBookingService
{
    private readonly BookingDbContext _context;

    public BookingService(BookingDbContext context)
    {
        _context = context;
    }

    public async Task<BookingDto> CreateAsync(CreateBookingDto dto, string userId)
    {
        var hotel = await _context.Hotels.FindAsync(dto.HotelId);
        if (hotel == null) throw new Exception("Отель не найден");

        var nights = (dto.CheckOut - dto.CheckIn).Days;
        if (nights <= 0) throw new Exception("Дата выезда должна быть позже даты заезда");

        // Считаем сколько активных броней пересекается с запрошенными датами
        var bookedRooms = await _context.Bookings.CountAsync(b =>
            b.HotelId == dto.HotelId &&
            b.Status == "Active" &&
            b.CheckIn < dto.CheckOut &&
            b.CheckOut > dto.CheckIn
        );

        if (bookedRooms >= hotel.TotalRooms)
            throw new Exception($"Свободных номеров нет. Все {hotel.TotalRooms} номеров заняты на эти даты");

        var booking = new Models.Booking
        {
            HotelId = dto.HotelId,
            UserId = userId,
            CheckIn = dto.CheckIn,
            CheckOut = dto.CheckOut,
            Guests = dto.Guests,
            TotalPrice = hotel.PricePerNight * nights,
            Status = "Active"
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return new BookingDto
        {
            Id = booking.Id,
            HotelId = hotel.Id,
            HotelName = hotel.Name,
            City = hotel.City,
            CheckIn = booking.CheckIn,
            CheckOut = booking.CheckOut,
            Guests = booking.Guests,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt
        };
    }

    public async Task<IEnumerable<BookingDto>> GetMyBookingsAsync(string userId)
    {
        return await _context.Bookings
            .Include(b => b.Hotel)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                HotelId = b.Hotel.Id,
                HotelName = b.Hotel.Name,
                City = b.Hotel.City,
                CheckIn = b.CheckIn,
                CheckOut = b.CheckOut,
                Guests = b.Guests,
                TotalPrice = b.TotalPrice,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();
    }

    public async Task CancelAsync(int bookingId, string userId)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null) throw new Exception("Бронь не найдена");
        if (booking.UserId != userId) throw new Exception("Нет доступа");
        if (booking.Status == "Cancelled") throw new Exception("Бронь уже отменена");

        booking.Status = "Cancelled";
        await _context.SaveChangesAsync();
    }
}