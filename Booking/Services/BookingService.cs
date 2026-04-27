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

        decimal pricePerNight = hotel.PricePerNight;
        string? roomTypeName = null;
        int totalAvailableRooms = hotel.TotalRooms;

        // Если выбран тип номера — проверяем его доступность
        if (dto.RoomTypeId.HasValue)
        {
            var roomType = await _context.RoomTypes.FindAsync(dto.RoomTypeId.Value);
            if (roomType == null) throw new Exception("Тип номера не найден");

            pricePerNight = roomType.PricePerNight;
            roomTypeName = roomType.Name;
            totalAvailableRooms = roomType.TotalRooms;

            var bookedRooms = await _context.Bookings
                .Where(b =>
                    b.RoomTypeId == dto.RoomTypeId &&
                    b.Status == "Active" &&
                    b.CheckIn < dto.CheckOut &&
                    b.CheckOut > dto.CheckIn)
                .SumAsync(b => b.Rooms);

            if (bookedRooms + dto.Rooms > totalAvailableRooms)
                throw new Exception($"Недостаточно свободных номеров. Доступно: {totalAvailableRooms - bookedRooms}");
        }
        else
        {
            // Общая проверка без типа номера
            var bookedRooms = await _context.Bookings
                .Where(b =>
                    b.HotelId == dto.HotelId &&
                    b.RoomTypeId == null &&
                    b.Status == "Active" &&
                    b.CheckIn < dto.CheckOut &&
                    b.CheckOut > dto.CheckIn)
                .SumAsync(b => b.Rooms);

            if (bookedRooms + dto.Rooms > hotel.TotalRooms)
                throw new Exception($"Свободных номеров нет. Все {hotel.TotalRooms} заняты на эти даты");
        }

        var booking = new Models.Booking
        {
            HotelId = dto.HotelId,
            RoomTypeId = dto.RoomTypeId,
            UserId = userId,
            CheckIn = dto.CheckIn,
            CheckOut = dto.CheckOut,
            Guests = dto.Guests,
            Rooms = dto.Rooms,
            TotalPrice = pricePerNight * nights * dto.Rooms,
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
            RoomTypeId = booking.RoomTypeId,
            RoomTypeName = roomTypeName,
            CheckIn = booking.CheckIn,
            CheckOut = booking.CheckOut,
            Guests = booking.Guests,
            Rooms = booking.Rooms,
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

    public async Task<IEnumerable<BookingDto>> GetBookingsForOwnerAsync(string ownerId)
    {
        return await _context.Bookings
            .Include(b => b.Hotel)
            .Where(b => b.Hotel.OwnerId == ownerId)
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
}