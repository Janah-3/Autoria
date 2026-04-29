namespace Autoria.features.Booking.Entities
{
    public class TimeSlot
    {
        public Guid Id { get; set; }
        public Guid ServiceCenterId { get; set; }
        public ServiceCenter.Entities.ServiceCenter ServiceCenter { get; set; } = default!;
        public DateOnly Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public bool IsBlocked { get; set; } = false;
        public bool IsBooked { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation — one slot can have at most one booking
        public Booking? Booking { get; set; }
    }
}
