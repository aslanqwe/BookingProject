using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booking.Migrations
{
    /// <inheritdoc />
    public partial class AddHotelAmenitiesRemoveTotalRooms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalRooms",
                table: "Hotels");

            migrationBuilder.AddColumn<string>(
                name: "HotelAmenities",
                table: "Hotels",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HotelAmenities",
                table: "Hotels");

            migrationBuilder.AddColumn<int>(
                name: "TotalRooms",
                table: "Hotels",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
