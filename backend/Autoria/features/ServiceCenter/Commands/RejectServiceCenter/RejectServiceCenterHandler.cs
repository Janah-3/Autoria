using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.RejectServiceCenter
{
    public class RejectServiceCenterHandler : IRequestHandler<RejectServiceCenterCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly IAdminLogService _logService;

        public RejectServiceCenterHandler(AppDbContext context, IAdminLogService logService)
        {
            _context = context;
            _logService = logService;
        }

        public async Task<Unit> Handle(RejectServiceCenterCommand request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .FirstOrDefaultAsync(sc => sc.Id == request.ServiceCenterId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            if (serviceCenter.ApprovalStatus != ApprovalStatus.Pending &&
                serviceCenter.ApprovalStatus != ApprovalStatus.UnderReview)
                throw new BadRequestException("Only pending or under review service centers can be rejected");

            serviceCenter.ApprovalStatus = ApprovalStatus.Rejected;
            serviceCenter.RejectionReason = request.RejectionReason;

            await _context.SaveChangesAsync(cancellationToken);

            await _logService.LogAsync(
                request.AdminId,
                AdminActionType.RejectServiceCenter,
                AdminTargetType.ServiceCenter,
                serviceCenter.Id.ToString(),
                $"Rejection reason: {request.RejectionReason}"
            );

            return Unit.Value;
        }
    }
}
