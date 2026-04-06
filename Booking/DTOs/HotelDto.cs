namespace Booking.DTOs;

public class HotelDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int Stars { get; set; } = 3;
    public int TotalRooms { get; set; } = 10;
    public string? ImageUrl { get; set; }
}