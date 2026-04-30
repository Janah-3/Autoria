using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.Notifications.Entities
{
    public class Notification
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = default!;
        public User User { get; set; } = default!;
        public NotificationType Type { get; set; }
        public NotificationChannel Channel { get; set; }
        public string Content { get; set; } = default!;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
    }
}
