using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reports.Queries.GetAllReports
{
    public class GetAllReportsHandler : IRequestHandler<GetAllReportsQuery, PagedResponse<ReportSummaryDto>>
    {
        private readonly AppDbContext _context;

        public GetAllReportsHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResponse<ReportSummaryDto>> Handle(GetAllReportsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Reports
                .Include(r => r.Reporter)
                .AsQueryable();

            if (request.Status.HasValue)
                query = query.Where(r => r.Status == request.Status.Value);

            if (request.TargetType.HasValue)
                query = query.Where(r => r.TargetType == request.TargetType.Value);

            if (request.Reason.HasValue)
                query = query.Where(r => r.Reason == request.Reason.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(r => new ReportSummaryDto
                {
                    Id = r.Id,
                    ReporterId = r.ReporterId,
                    ReporterName = r.Reporter.FullName,
                    TargetType = r.TargetType,
                    TargetId = r.TargetId,
                    Reason = r.Reason,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return new PagedResponse<ReportSummaryDto>(items, totalCount, request.Page, request.PageSize);
        }
    }
}
