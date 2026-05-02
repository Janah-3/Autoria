using Autoria.features.SpareParts.Enums;

namespace Autoria.features.SpareParts.Dtos
{
    public class ReservationDto
    {
        public Guid Id { get; set; }
        public string PartName { get; set; } = default!;
        public string PartNumber { get; set; } = default!;
        public string ServiceCenterName { get; set; } = default!;
        public Guid? BookingId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public ReservationStatus Status { get; set; }
        public DateTime ReservedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string? CancellationReason { get; set; }
    }
}
