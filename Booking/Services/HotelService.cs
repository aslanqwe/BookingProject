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
                TotalRooms = h.TotalRooms,
                ImageUrl = h.ImageUrl 
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
            TotalRooms = dto.TotalRooms,
            ImageUrl = dto.ImageUrl
        };

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        dto.Id = hotel.Id;
        return dto;
    }
    
    public async Task<HotelDto?> UpdateAsync(int id, HotelDto dto, string ownerId)
    {
        var hotel = await _context.Hotels.FindAsync(id);
        if (hotel == null || hotel.OwnerId != ownerId) return null;

        hotel.Name = dto.Name;
        hotel.City = dto.City;
        hotel.Description = dto.Description;
        hotel.PricePerNight = dto.PricePerNight;
        hotel.Stars = dto.Stars;
        hotel.TotalRooms = dto.TotalRooms;
        if (!string.IsNullOrEmpty(dto.ImageUrl))
            hotel.ImageUrl = dto.ImageUrl;

        await _context.SaveChangesAsync();

        return new HotelDto {
            Id = hotel.Id,
            Name = hotel.Name,
            City = hotel.City,
            Description = hotel.Description,
            PricePerNight = hotel.PricePerNight,
            Stars = hotel.Stars,
            TotalRooms = hotel.TotalRooms,
            ImageUrl = hotel.ImageUrl
        };
    }
}