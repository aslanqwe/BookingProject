namespace Booking.Models;

public class RoomType
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public Hotel Hotel { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty; // Стандартный, Люкс, Бизнес...
    public string? Description { get; set; }
    public decimal PricePerNight { get; set; }
    public int TotalRooms { get; set; } = 1;
    public int MaxGuests { get; set; } = 2;
    public string? Amenities { get; set; } // "Wi-Fi, Кондиционер, ТВ" через запятую
    public string? ImageUrl { get; set; }
}