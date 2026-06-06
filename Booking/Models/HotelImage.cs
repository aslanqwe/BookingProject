namespace Booking.Models;

public class HotelImage
{
    public int Id { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public int HotelId { get; set; }

    public Hotel Hotel { get; set; } = null!;
}