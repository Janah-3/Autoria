using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.ContactUs.Entity
{
    public class ContactMessage
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }          // null if sent by guest
        public User? User { get; set; }
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Subject { get; set; } = default!;
        public string Message { get; set; } = default!;
        public bool IsResolved { get; set; } = false;
        public string? AdminNotes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
    }
}
