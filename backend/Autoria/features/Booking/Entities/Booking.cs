using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Entities;

namespace Autoria.features.Booking.Entities
{
    public class Booking
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = default!;
        public User User { get; set; } = default!;
        public Guid CarId { get; set; }
        public Car.Entity.Car Car { get; set; } = default!;
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter.Entities.ServiceCenter ServiceCenter { get; set; } = default!;
        public Guid ServiceTypeId { get; set; }
        public ServiceType ServiceType { get; set; } = default!;
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
        public DateTime Appointment { get; set; }
        public string? Notes { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid? TimeSlotId { get; set; }
        public TimeSlot? TimeSlot { get; set; }
    }
}
