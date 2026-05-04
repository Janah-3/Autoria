using Autoria.features.PartReservations.Enums;

namespace Autoria.features.PartReservations.Dtos
{
    public class ReservationDto
    {
        public Guid Id { get; set; }
        public string SparePartName { get; set; } = string.Empty;
        public string ServiceCenterName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public ReservationStatus Status { get; set; }
        public Guid? BookingId { get; set; }
        public DateTime ReservedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? PickedUpAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
    }
}