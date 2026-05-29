using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.MileageTracking.Entities
{
    public class MileageEntry
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = default!;
        public User User { get; set; } = default!;
        public Guid CarId { get; set; }
        public Car.Entity.Car Car { get; set; } = default!;
        public int Mileage { get; set; }
        public string? Notes { get; set; }
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
    }
}
