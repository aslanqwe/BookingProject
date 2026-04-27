using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Booking.Models;


namespace Booking.Data;

public class BookingDbContext : IdentityDbContext
{
    public BookingDbContext(DbContextOptions<BookingDbContext> options) 
        : base(options) 
    { 
        
    }

    public DbSet<Hotel> Hotels { get; set; }
    public DbSet<Booking.Models.Booking> Bookings { get; set; } 
    public DbSet<RoomType> RoomTypes { get; set; } 
}