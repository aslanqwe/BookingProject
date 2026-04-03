namespace Booking.DTOs;

public class BookingDto
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public int Guests { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBookingDto
{
    public int HotelId { get; set; }
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public int Guests { get; set; }
}