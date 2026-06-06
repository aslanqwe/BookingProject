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

    public async Task<HotelDto?> GetByIdAsync(int id)
    {
        var h = await _context.Hotels
            .Include(h => h.RoomTypes)
            .Include(h => h.Images)
            .FirstOrDefaultAsync(h => h.Id == id && !h.IsDeleted);
        return h == null ? null : MapToDto(h);
    }

    public async Task<(IEnumerable<HotelDto> Hotels, int TotalCount)> GetAllAsync(string? city, decimal? maxPrice,
        int? stars,
        DateOnly? checkIn, DateOnly? checkOut, int? guests, int? roomsCount,
        int page, int pageSize, string? sortBy, string? propertyType = null)
    {
        var query = _context.Hotels
            .Include(h => h.RoomTypes)
            .Include(h => h.Images)
            .Where(h => !h.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrEmpty(propertyType))
            query = query.Where(h => h.PropertyType == propertyType);
        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(h => h.City.ToLower().Contains(city.ToLower()));
        if (maxPrice.HasValue)
            query = query.Where(h =>
                h.RoomTypes.Any()
                    ? h.RoomTypes.Min(rt => rt.PricePerNight) <= maxPrice.Value
                    : h.PricePerNight <= maxPrice.Value);
        if (stars.HasValue)
            query = query.Where(h => h.Stars == stars.Value);

        if (checkIn.HasValue && checkOut.HasValue)
        {
            int reqRooms = roomsCount ?? 1;
            int reqGuests = guests ?? 1;

            query = query.Where(hotel => _context.RoomTypes.Any(rt =>
                rt.HotelId == hotel.Id &&
                (rt.MaxGuests * reqRooms >= reqGuests) &&
                (rt.TotalRooms - _context.Bookings
                    .Where(b =>
                        b.RoomTypeId == rt.Id &&
                        b.Status == "Active" &&
                        b.CheckIn < checkOut.Value &&
                        b.CheckOut > checkIn.Value)
                    .Sum(b => (int?)b.Rooms ?? 0) >= reqRooms)
            ));
        }

        query = sortBy switch
        {
            "price_asc" => query
                .OrderBy(h => h.RoomTypes.Any() ? h.RoomTypes.Min(rt => rt.PricePerNight) : h.PricePerNight)
                .ThenBy(h => h.Id), 
        
            "price_desc" => query
                .OrderByDescending(h => h.RoomTypes.Any() ? h.RoomTypes.Min(rt => rt.PricePerNight) : h.PricePerNight)
                .ThenBy(h => h.Id),
        
            "stars_desc" => query
                .OrderByDescending(h => h.Stars)
                .ThenBy(h => h.Id),
        
            "stars_asc" => query
                .OrderBy(h => h.Stars)
                .ThenBy(h => h.Id),
        
            _ => query.OrderBy(h => h.Id)
        };

        var totalCount = await query.CountAsync();
        var hotels = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (hotels.Select(MapToDto), totalCount);
    }

    public async Task<HotelDto> CreateAsync(HotelDto dto, string ownerId)
    {
        var hotel = new Hotel
        {
            Name = dto.Name,
            City = dto.City,
            Address = dto.Address,
            Description = dto.Description,
            PricePerNight = dto.PricePerNight,
            Stars = dto.Stars,
            PropertyType = dto.PropertyType,
            HotelAmenities = dto.HotelAmenities,
            OwnerId = ownerId,
            
            Images = dto.Images.Select(url => new HotelImage
            {
            ImageUrl = url
        }).ToList()
        };

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        dto.Id = hotel.Id;
        dto.TotalRooms = 0;
        return dto;
    }

    public async Task<HotelDto?> UpdateAsync(int id, HotelDto dto, string ownerId)
    {
        var hotel = await _context.Hotels
            .Include(h => h.RoomTypes)
            .Include(h => h.Images)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hotel == null || hotel.OwnerId != ownerId) return null;

        hotel.Name = dto.Name;
        hotel.City = dto.City;
        hotel.Address = dto.Address;
        hotel.Description = dto.Description;
        hotel.PricePerNight = dto.PricePerNight;
        hotel.Stars = dto.Stars;
        hotel.PropertyType = dto.PropertyType;
        hotel.HotelAmenities = dto.HotelAmenities;
        hotel.Images.Clear();

        foreach (var imageUrl in dto.Images)
        {
            hotel.Images.Add(new HotelImage
            {
                ImageUrl = imageUrl
            });
        }

        await _context.SaveChangesAsync();
        return MapToDto(hotel);
    }

    private static HotelDto MapToDto(Hotel h) => new HotelDto
    {
        Id = h.Id,
        Name = h.Name,
        City = h.City,
        Address = h.Address,
        Description = h.Description,
        PricePerNight = h.RoomTypes != null && h.RoomTypes.Any() 
            ? h.RoomTypes.Min(rt => rt.PricePerNight) 
            : h.PricePerNight,
        Stars = h.Stars,
        Images = h.Images
            .Select(i => i.ImageUrl)
            .ToList(),
        PropertyType = h.PropertyType,
        HotelAmenities = h.HotelAmenities,
        TotalRooms = h.RoomTypes?.Sum(rt => rt.TotalRooms) ?? 0
    };

    public async Task<bool> DeleteAsync(int id, string ownerId)
    {
        var hotel = await _context.Hotels.FindAsync(id);
        if (hotel == null || hotel.OwnerId != ownerId) return false;

        hotel.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }
}