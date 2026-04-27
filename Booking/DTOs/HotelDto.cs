namespace Booking.DTOs;

public class HotelDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public decimal PricePerNight { get; set; }
    public int Stars { get; set; } = 3;
    public int TotalRooms { get; set; } = 10;
    public string? ImageUrl { get; set; }
    public string PropertyType { get; set; } = "Отель";
    public List<RoomTypeDto> RoomTypes { get; set; } = new();
}