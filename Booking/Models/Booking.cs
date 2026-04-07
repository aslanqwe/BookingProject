namespace Booking.Models;

public class Booking
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public Hotel Hotel { get; set; } = null!;
    public string UserId { get; set; } = string.Empty;
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public int Guests { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int Rooms { get; set; } = 1;
}