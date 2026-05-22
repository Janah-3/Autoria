using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reports.Queries.GetReportDetails
{
    public class GetReportDetailsHandler : IRequestHandler<GetReportDetailsQuery, ReportDetailsDto>
    {
        private readonly AppDbContext _context;

        public GetReportDetailsHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ReportDetailsDto> Handle(GetReportDetailsQuery request, CancellationToken cancellationToken)
        {
            var report = await _context.Reports
                .Include(r => r.Reporter)
                .Include(r => r.Reviewer)
                .FirstOrDefaultAsync(r => r.Id == request.ReportId, cancellationToken)
                    ?? throw new NotFoundException("Report not found");

            return new ReportDetailsDto
            {
                Id = report.Id,
                ReporterId = report.ReporterId,
                ReporterName = report.Reporter.FullName,
                TargetType = report.TargetType,
                TargetId = report.TargetId,
                Reason = report.Reason,
                Details = report.Details,
                Status = report.Status,
                ReviewedBy = report.ReviewedBy,
                ReviewerName = report.Reviewer?.FullName,
                ResolutionNote = report.ResolutionNote,
                CreatedAt = report.CreatedAt,
                ReviewedAt = report.ReviewedAt
            };
        }
    }
}
