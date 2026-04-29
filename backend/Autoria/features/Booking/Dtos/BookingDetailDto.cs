namespace Autoria.features.Booking.Dtos
{
    public class BookingDetailDto
    {
    public Guid Id { get; set; }
        public string UserId { get; set; } = default!;
        public string UserName { get; set; } = default!;

        public Guid CarId { get; set; }
        public string CarMake { get; set; } = default!;
        public string CarModel { get; set; } = default!;
        public int CarYear { get; set; }
        public string CarLicensePlate { get; set; } = default!;
        public string CarColor { get; set; } = default!;
        public int CarMileage { get; set; }

        public Guid ServiceCenterId { get; set; }
        public string ServiceCenterName { get; set; } = default!;

        public Guid ServiceTypeId { get; set; }
        public string ServiceTypeName { get; set; } = default!;

        public BookingStatus Status { get; set; }
        public DateTime Appointment { get; set; }
        public string? Notes { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
