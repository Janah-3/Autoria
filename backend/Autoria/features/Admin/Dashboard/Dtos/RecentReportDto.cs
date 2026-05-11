namespace Autoria.Features.Admin.Dashboard.Dtos;

public record RecentReportDto(
    Guid ReportId,
    string Reason,
    string TargetType,
    string TargetName,
    string ReportedBy,
    string Status,
    bool IsUrgent,
    DateTime CreatedAt
);