using Autoria.features.Reports.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reports.Commands.ResolveReport
{
    public class ResolveReportHandler : IRequestHandler<ResolveReportCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ResolveReportHandler(AppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(ResolveReportCommand request, CancellationToken cancellationToken)
        {
            var adminId = _currentUserService.GetUserId();

            var report = await _context.Reports
                .FirstOrDefaultAsync(r => r.Id == request.ReportId, cancellationToken)
                    ?? throw new NotFoundException("Report not found");

            if (report.Status == ReportStatus.Resolved)
                throw new BadRequestException("Report is already resolved");

            report.Status = ReportStatus.Resolved;
            report.ReviewedBy = adminId;
            report.ResolutionNote = request.ResolutionNote;
            report.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
