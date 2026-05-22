using Autoria.features.Reports.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reports.Commands.DismissReport
{
    public class DismissReportHandler : IRequestHandler<DismissReportCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public DismissReportHandler(AppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(DismissReportCommand request, CancellationToken cancellationToken)
        {
            var adminId = _currentUserService.GetUserId();

            var report = await _context.Reports
                .FirstOrDefaultAsync(r => r.Id == request.ReportId, cancellationToken)
                    ?? throw new NotFoundException("Report not found");

            if (report.Status == ReportStatus.Dismissed)
                throw new BadRequestException("Report is already dismissed");

            if (report.Status == ReportStatus.Resolved)
                throw new BadRequestException("Cannot dismiss an already resolved report");

            report.Status = ReportStatus.Dismissed;
            report.ReviewedBy = adminId;
            report.ResolutionNote = request.ResolutionNote;
            report.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
