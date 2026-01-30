using Booking.Data;
using Booking.Models;
using Booking.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Booking.Services;

public class HotelService : IHotelService
{
    private readonly BookingDbContext _context;

    public HotelService(BookingDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HotelDto>> GetAllAsync()
    {
        return await _context.Hotels
            .Select(h => new HotelDto {
                Id = h.Id,
                Name = h.Name,
                City = h.City,
                Description = h.Description,
                PricePerNight = h.PricePerNight
            }).ToListAsync();
    }

    public async Task<HotelDto> CreateAsync(HotelDto dto, string ownerId)
    {
        var hotel = new Hotel {
            Name = dto.Name,
            City = dto.City,
            Description = dto.Description,
            PricePerNight = dto.PricePerNight,
            OwnerId = ownerId
        };

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        dto.Id = hotel.Id;
        return dto;
    }
}