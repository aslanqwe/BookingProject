using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Booking.Data;
using Booking.Models;

namespace Booking.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelsController : ControllerBase
{
    private readonly BookingDbContext _context;

    public HotelsController(BookingDbContext context)
    {
        _context = context;
    }

    // GET: api/hotels
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Hotel>>> GetHotels()
    {
        return await _context.Hotels.ToListAsync();
    }

    // POST: api/hotels
    [HttpPost]
    public async Task<ActionResult<Hotel>> CreateHotel(Hotel hotel)
    {
        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();
        return Ok(hotel);
    }
}