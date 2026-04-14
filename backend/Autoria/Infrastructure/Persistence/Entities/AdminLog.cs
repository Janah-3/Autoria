using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Enums;

namespace Autoria.Infrastructure.Persistence.Entities
{
    public class AdminLog
    {
        public Guid Id { get; set; }
        public string CreatedById { get; set; } = default!;
        public User CreatedBy { get; set; } = default!;
        public AdminActionType ActionType { get; set; }
        public AdminTargetType TargetType { get; set; }
        public string TargetId { get; set; } = default!;
        public string? Details { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    }
}
