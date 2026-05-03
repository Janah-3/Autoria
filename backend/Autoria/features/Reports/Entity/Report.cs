using System;
using Autoria.features.Reports.Enums;
using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.Reports.Entity
{
    public class Report
    {
        public Guid Id { get; set; }
        public string ReporterId { get; set; } = default!;
        public User Reporter { get; set; } = default!;
        public ReportTaregetType TargetType { get; set; }
        public Guid TargetId { get; set; }
        public ReportReason Reason { get; set; }
        public string? Details { get; set; }
        public ReportStatus Status { get; set; } = ReportStatus.Pending;
        public string? ReviewedBy { get; set; }
        public User? Reviewer { get; set; }
        public string? ResolutionNote { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
    }
}
