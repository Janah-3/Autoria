using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.SpareParts.Entities
{
    public class PartReservation
    {
        public Guid Id { get; set; }
        public string ClientId { get; set; } = default!;
        public User Client { get; set; } = default!;
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter.Entities.ServiceCenter ServiceCenter { get; set; } = default!;
        public Guid SparePartId { get; set; }
        public SparePart SparePart { get; set; } = default!;
        public Guid? BookingId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice => Quantity * UnitPrice;
        public Enums.ReservationStatus Status { get; set; } = Enums.ReservationStatus.Pending;
        public DateTime ReservedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; }
        public string? CancellationReason { get; set; }
    }
}
