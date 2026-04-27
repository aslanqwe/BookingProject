namespace Booking.DTOs;

public class RoomTypeDto
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PricePerNight { get; set; }
    public int TotalRooms { get; set; }
    public int MaxGuests { get; set; }
    public string? Amenities { get; set; }
    public string? ImageUrl { get; set; }
    public int AvailableRooms { get; set; } // будет заполняться динамически
}