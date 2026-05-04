using Booking.DTOs;
using Booking.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Booking.Data;
using Microsoft.EntityFrameworkCore;

namespace Booking.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelsController : ControllerBase
{
    private readonly IHotelService _hotelService;

    public HotelsController(IHotelService hotelService)
    {
        _hotelService = hotelService;
    }

    [HttpGet]
    public async Task<IActionResult> GetHotels(
        [FromQuery] string? city,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? stars,
        [FromQuery] DateTime? checkIn, 
        [FromQuery] DateTime? checkOut, 
        [FromQuery] int? guests, 
        [FromQuery] int? rooms, 
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string? sortBy = null)
    {
        var (hotels, totalCount) = await _hotelService.GetAllAsync(
            city, maxPrice, stars, checkIn, checkOut, guests, rooms, page, pageSize, sortBy);

        return Ok(new {
            hotels,
            totalCount,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            currentPage = page
        });
    }
    
    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> CreateHotel([FromBody] HotelDto hotelDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _hotelService.CreateAsync(hotelDto, userId);
        return Ok(result);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetHotelById(int id)
    {
        var hotel = await _hotelService.GetByIdAsync(id);
        if (hotel == null) return NotFound();
        return Ok(hotel);
    }
    
    [HttpGet("{id}/availability")]
    public async Task<IActionResult> GetAvailability(
        int id,
        [FromQuery] DateTime checkIn,
        [FromQuery] DateTime checkOut,
        [FromServices] BookingDbContext context)
    {
        var hotel = await context.Hotels
            .Include(h => h.RoomTypes)
            .FirstOrDefaultAsync(h => h.Id == id);
        if (hotel == null) return NotFound();

        var totalRooms = hotel.RoomTypes.Sum(rt => rt.TotalRooms);

        var bookedRooms = await context.Bookings
            .Where(b =>
                b.HotelId == id &&
                b.Status == "Active" &&
                b.CheckIn < checkOut &&
                b.CheckOut > checkIn)
            .SumAsync(b => b.Rooms);

        var availableRooms = totalRooms - bookedRooms;

        return Ok(new
        {
            totalRooms,
            bookedRooms,
            availableRooms,
            isAvailable = availableRooms > 0
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> UpdateHotel(int id, [FromBody] HotelDto hotelDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _hotelService.UpdateAsync(id, hotelDto, userId);
        if (result == null) return NotFound(new { message = "Отель не найден или нет доступа" });

        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> GetMyHotels([FromServices] BookingDbContext context)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var hotels = await context.Hotels
            .Include(h => h.RoomTypes)
            .Where(h => h.OwnerId == userId && !h.IsDeleted)
            .ToListAsync();

        var result = hotels.Select(h => new HotelDto
        {
            Id = h.Id,
            Name = h.Name,
            City = h.City,
            Address = h.Address,
            Description = h.Description,
            PricePerNight = h.PricePerNight,
            Stars = h.Stars,
            ImageUrl = h.ImageUrl,
            PropertyType = h.PropertyType,
            HotelAmenities = h.HotelAmenities,
            TotalRooms = h.RoomTypes.Sum(rt => rt.TotalRooms)
        });

        return Ok(result);
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> DeleteHotel(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _hotelService.DeleteAsync(id, userId);
        if (!result) return NotFound(new { message = "Отель не найден или нет доступа" });

        return Ok(new { message = "Отель удалён" });
    }
}