using Autoria.features.Reports.Enums;
using MediatR;

namespace Autoria.features.Reports.Queries.GetReportDetails
{
    public record GetReportDetailsQuery(Guid ReportId) : IRequest<ReportDetailsDto>;

    public class ReportDetailsDto
    {
        public Guid Id { get; set; }
        public string ReporterId { get; set; } = default!;
        public string ReporterName { get; set; } = default!;
        public ReportTaregetType TargetType { get; set; }
        public Guid TargetId { get; set; }
        public ReportReason Reason { get; set; }
        public string? Details { get; set; }
        public ReportStatus Status { get; set; }
        public string? ReviewedBy { get; set; }
        public string? ReviewerName { get; set; }
        public string? ResolutionNote { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
    }
}
