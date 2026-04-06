using Booking.DTOs;
using Booking.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string? sortBy = null)
    {
        var (hotels, totalCount) = await _hotelService.GetAllAsync(city, maxPrice, stars, page, pageSize, sortBy);
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
}