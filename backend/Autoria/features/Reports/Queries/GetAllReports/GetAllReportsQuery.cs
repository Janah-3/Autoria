using Autoria.features.Reports.Enums;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Reports.Queries.GetAllReports
{
    public record GetAllReportsQuery(
     ReportStatus? Status,
     ReportTaregetType? TargetType,
     ReportReason? Reason,
     int Page = 1,
     int PageSize = 10
 ) : IRequest<PagedResponse<ReportSummaryDto>>;

    public class ReportSummaryDto
    {
        public Guid Id { get; set; }
        public string ReporterId { get; set; } = default!;
        public string ReporterName { get; set; } = default!;
        public ReportTaregetType TargetType { get; set; }
        public Guid TargetId { get; set; }
        public ReportReason Reason { get; set; }
        public ReportStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
