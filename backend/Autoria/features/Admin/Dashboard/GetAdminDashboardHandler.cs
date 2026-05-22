using Autoria.features.Admin.Dashboard.Dtos;
using Autoria.features.Admin.Dashboard;
using Autoria.features.Reports.Enums;
using Autoria.Features.Admin.Dashboard.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.Admin.Dashboard;

public class GetAdminDashboardHandler : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
{
    private readonly AppDbContext _dbContext;

    public GetAdminDashboardHandler(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AdminDashboardDto> Handle(
        GetAdminDashboardQuery request,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Metrics
        var totalUsers = await _dbContext.Users.CountAsync(cancellationToken);

        var bookingsThisMonth = await _dbContext.Bookings
            .CountAsync(b => b.CreatedAt >= startOfMonth, cancellationToken);

        var approvedCenters = await _dbContext.ServiceCenters
            .Where(sc => sc.ApprovalStatus == ApprovalStatus.Approved &&  sc.IsDeleted == false)
            .ToListAsync(cancellationToken);

        var activeCenters = approvedCenters.Count;

        var avgServiceCenterRating = approvedCenters.Any()
            ? Math.Round(approvedCenters.Average(sc => sc.Rating), 1)
            : 0.0;

        var reportedReviews = await _dbContext.Reports
            .CountAsync(r => r.TargetType == ReportTaregetType.Review, cancellationToken);

        var urgentReasons = new[] { ReportReason.Fake, ReportReason.Offensive, ReportReason.Inappropriate };
        var urgentStatuses = new[] { ReportStatus.Pending, ReportStatus.UnderReview };

        var urgentReports = await _dbContext.Reports
            .CountAsync(r =>
                urgentReasons.Contains(r.Reason) &&
                urgentStatuses.Contains(r.Status),
                cancellationToken);

        var pendingCenterRequests = await _dbContext.ServiceCenters
            .CountAsync(sc => sc.ApprovalStatus == ApprovalStatus.Pending, cancellationToken);

        var metrics = new DashboardMetricsDto
        {
            TotalUsers = totalUsers,
            bookingsThisMonth = bookingsThisMonth,
            activeCenters = activeCenters,
            avgServiceCenterRating = avgServiceCenterRating
        };

        // Pending approvals
        var pendingApprovals = await _dbContext.ServiceCenters
     .Where(sc => sc.ApprovalStatus == ApprovalStatus.Pending)
     .OrderBy(sc => sc.CreatedAt) // or SubmittedAt if exists in entity
     .Select(sc => new PendingApprovalDto(
         sc.Id,
         sc.Name,
         sc.OwnerFullName,
         sc.Address,
         sc.CreatedAt
     ))
     .ToListAsync(cancellationToken);

        // Recent reports
        var reports = await _dbContext.Reports
            .Where(r => r.Status == ReportStatus.Pending || r.Status == ReportStatus.UnderReview)
            .Include(r => r.Reporter)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        // Batch resolve target names
        var serviceCenterIds = reports
            .Where(r => r.TargetType == ReportTaregetType.ServiceCenter)
            .Select(r => r.TargetId).ToList();

        var reviewIds = reports
            .Where(r => r.TargetType == ReportTaregetType.Review)
            .Select(r => r.TargetId).ToList();

        var issueIds = reports
            .Where(r => r.TargetType == ReportTaregetType.issue)
            .Select(r => r.TargetId).ToList();

        var serviceCenterNames = await _dbContext.ServiceCenters
            .Where(sc => serviceCenterIds.Contains(sc.Id))
            .ToDictionaryAsync(sc => sc.Id, sc => sc.Name, cancellationToken);

        var reviewNames = await _dbContext.Reviews
            .Where(r => reviewIds.Contains(r.Id))
            .ToDictionaryAsync(r => r.Id, r => r.ServiceCenter.Name, cancellationToken);

        // map reports to dtos
        var recentReports = reports.Select(r =>
        {
            var targetName = r.TargetType switch
            {
                ReportTaregetType.ServiceCenter => serviceCenterNames.GetValueOrDefault(r.TargetId, "Unknown"),
                ReportTaregetType.Review => reviewNames.GetValueOrDefault(r.TargetId, "Unknown"),
                ReportTaregetType.issue => "Issue #" + r.TargetId.ToString()[..8],
                _ => "Unknown"
            };

            var isUrgent = urgentReasons.Contains(r.Reason) &&
                           urgentStatuses.Contains(r.Status);

            return new RecentReportDto(
                ReportId: r.Id,
                Reason: r.Reason.ToString(),
                TargetType: r.TargetType.ToString(),
                TargetName: targetName,
                ReportedBy: r.Reporter.FullName,
                Status: r.Status.ToString(),
                IsUrgent: isUrgent,
                CreatedAt: r.CreatedAt
            );
        }).ToList();

        return new AdminDashboardDto(
            Metrics: metrics,
            PendingApprovals: pendingApprovals,
            RecentReports: recentReports
        );
    }
}