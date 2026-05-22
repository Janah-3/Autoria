using Autoria.features.Admin.Dashboard.Dtos;

namespace Autoria.Features.Admin.Dashboard.Dtos;

public record AdminDashboardDto(
    DashboardMetricsDto Metrics,
    List<PendingApprovalDto> PendingApprovals,
    List<RecentReportDto> RecentReports
);