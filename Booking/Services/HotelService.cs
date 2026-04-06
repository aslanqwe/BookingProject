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

    public async Task<(IEnumerable<HotelDto> Hotels, int TotalCount)> GetAllAsync(string? city, decimal? maxPrice, int? stars, int page, int pageSize, string? sortBy)
    {
        var query = _context.Hotels.AsQueryable();

        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(h => h.City.ToLower().Contains(city.ToLower()));
        if (maxPrice.HasValue)
            query = query.Where(h => h.PricePerNight <= maxPrice.Value);
        if (stars.HasValue)
            query = query.Where(h => h.Stars == stars.Value);

        query = sortBy switch
        {
            "price_asc" => query.OrderBy(h => h.PricePerNight),
            "price_desc" => query.OrderByDescending(h => h.PricePerNight),
            "stars_desc" => query.OrderByDescending(h => h.Stars),
            "stars_asc" => query.OrderBy(h => h.Stars),
            _ => query.OrderBy(h => h.Id)
        };

        var totalCount = await query.CountAsync();

        var hotels = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(h => new HotelDto {
                Id = h.Id,
                Name = h.Name,
                City = h.City,
                Description = h.Description,
                PricePerNight = h.PricePerNight,
                Stars = h.Stars,
                TotalRooms = h.TotalRooms
            }).ToListAsync();

        return (hotels, totalCount);
    }

    public async Task<HotelDto> CreateAsync(HotelDto dto, string ownerId)
    {
        var hotel = new Hotel {
            Name = dto.Name,
            City = dto.City,
            Description = dto.Description,
            PricePerNight = dto.PricePerNight,
            OwnerId = ownerId,
            Stars = dto.Stars,
            TotalRooms = dto.TotalRooms
        };

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        dto.Id = hotel.Id;
        return dto;
    }
}