using System.Security.Claims;
using Autoria.features.Reports.Entity;
using Autoria.features.Reports.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reports.Commands.AddReport
{
    public class AddReportHandler : IRequestHandler<AddReportCommand, Unit>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly AppDbContext _dbContext;

        public AddReportHandler(ICurrentUserService currentUserService, AppDbContext dbContext)
        {
            _currentUserService = currentUserService;
            _dbContext = dbContext;
        }

        public async Task<Unit> Handle(AddReportCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();

            // Prevent duplicate reports from the same user on the same target
            var alreadyReported = await _dbContext.Reports
                .AnyAsync(r =>
                    r.ReporterId == userId &&
                    r.TargetType == request.TargetType &&
                    r.TargetId == request.TargetId, cancellationToken);

            if (alreadyReported)
                throw new BadRequestException("You have already reported this");

            var report = new Report
            {
                Id = Guid.NewGuid(),
                ReporterId = userId,
                TargetType = request.TargetType,
                TargetId = request.TargetId,
                Reason = request.Reason,
                Details = request.Details,
                Status = ReportStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Reports.AddAsync(report, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
