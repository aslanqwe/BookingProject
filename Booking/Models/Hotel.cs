namespace Booking.Models;

public class Hotel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public string? OwnerId { get; set; }
    public int Stars { get; set; } = 3;
    public ICollection<HotelImage> Images { get; set; }
        = new List<HotelImage>();
    public string PropertyType { get; set; } = "Отель"; // Отель, Апартаменты, Хостел, Гостевой дом
    public string? Address { get; set; }
    public string? HotelAmenities { get; set; }
    public bool IsDeleted { get; set; } = false;
    public ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();
}