namespace Autoria.features.Booking.Dtos
{
    public class BookingSummaryDto
    {
        public Guid Id { get; set; }
        public string ServiceCenterName { get; set; } = default!;
        public string ServiceTypeName { get; set; } = default!;
        public string CarLicensePlate { get; set; } = default!;
        public BookingStatus Status { get; set; }
        public DateTime Appointment { get; set; }
        public decimal? TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
