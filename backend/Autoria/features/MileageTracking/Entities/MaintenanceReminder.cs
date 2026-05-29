using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.MileageTracking.Entities
{
    public class MaintenanceReminder
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = default!;
        public User User { get; set; } = default!;
        public Guid CarId { get; set; }
        public Car.Entity.Car Car { get; set; } = default!;
        public string Title { get; set; } = default!;       // e.g. "Oil Change"
        public int MileageThreshold { get; set; }            // trigger at this mileage
        public bool IsTriggered { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? TriggeredAt { get; set; }
    }
}
