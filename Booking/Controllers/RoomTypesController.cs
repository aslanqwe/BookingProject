using Booking.Data;
using Booking.DTOs;
using Booking.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Booking.Controllers;

[ApiController]
[Route("api/hotels/{hotelId}/roomtypes")]
public class RoomTypesController : ControllerBase
{
    private readonly BookingDbContext _context;

    public RoomTypesController(BookingDbContext context)
    {
        _context = context;
    }

    // Получить все типы номеров отеля с доступностью
    [HttpGet]
    public async Task<IActionResult> GetRoomTypes(
        int hotelId,
        [FromQuery] DateTime? checkIn,
        [FromQuery] DateTime? checkOut)
    {
        var roomTypes = await _context.RoomTypes
            .Where(rt => rt.HotelId == hotelId)
            .ToListAsync();

        var result = new List<RoomTypeDto>();

        foreach (var rt in roomTypes)
        {
            int bookedRooms = 0;
            if (checkIn.HasValue && checkOut.HasValue)
            {
                bookedRooms = await _context.Bookings
                    .Where(b =>
                        b.RoomTypeId == rt.Id &&
                        b.Status == "Active" &&
                        b.CheckIn < checkOut.Value &&
                        b.CheckOut > checkIn.Value)
                    .SumAsync(b => b.Rooms);
            }

            result.Add(new RoomTypeDto
            {
                Id = rt.Id,
                HotelId = rt.HotelId,
                Name = rt.Name,
                Description = rt.Description,
                PricePerNight = rt.PricePerNight,
                TotalRooms = rt.TotalRooms,
                MaxGuests = rt.MaxGuests,
                Amenities = rt.Amenities,
                ImageUrl = rt.ImageUrl,
                AvailableRooms = rt.TotalRooms - bookedRooms
            });
        }

        return Ok(result);
    }

    // Добавить тип номера (только владелец)
    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> CreateRoomType(int hotelId, [FromBody] RoomTypeDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var hotel = await _context.Hotels.FindAsync(hotelId);

        if (hotel == null || hotel.OwnerId != userId)
            return Forbid();

        var roomType = new RoomType
        {
            HotelId = hotelId,
            Name = dto.Name,
            Description = dto.Description,
            PricePerNight = dto.PricePerNight,
            TotalRooms = dto.TotalRooms,
            MaxGuests = dto.MaxGuests,
            Amenities = dto.Amenities,
            ImageUrl = dto.ImageUrl
        };

        _context.RoomTypes.Add(roomType);
        await _context.SaveChangesAsync();

        dto.Id = roomType.Id;
        return Ok(dto);
    }

    // Удалить тип номера
    [HttpDelete("{id}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> DeleteRoomType(int hotelId, int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var hotel = await _context.Hotels.FindAsync(hotelId);
        if (hotel == null || hotel.OwnerId != userId) return Forbid();

        var roomType = await _context.RoomTypes.FindAsync(id);
        if (roomType == null || roomType.HotelId != hotelId) return NotFound();

        _context.RoomTypes.Remove(roomType);
        await _context.SaveChangesAsync();
        return Ok();
    }
}