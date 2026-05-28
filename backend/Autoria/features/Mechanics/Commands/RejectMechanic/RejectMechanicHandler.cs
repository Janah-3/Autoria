using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.Mechanics.Commands.RejectMechanic
{
    public class RejectMechanicHandler : IRequestHandler<RejectMechanicCommand, Unit>
    {
        private readonly AppDbContext _dbContext;
        private readonly IAdminLogService _logService;
        private readonly ICurrentUserService _currentUser;

        public RejectMechanicHandler(AppDbContext dbContext, IAdminLogService logService , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _logService = logService;
            _currentUser =  currentUser;
        }

        public async Task<Unit> Handle(RejectMechanicCommand request, CancellationToken cancellationToken)
        {

            var AdminId = _currentUser.GetUserId();

            var profile = await _dbContext.MechanicProfiles
                .FirstOrDefaultAsync(m => m.Id == request.MechanicId, cancellationToken)
                    ?? throw new NotFoundException("Mechanic not found");

            if (profile.ApprovalStatus != ApprovalStatus.Pending)
                throw new BadRequestException("Only pending mechanics can be rejected");

            profile.ApprovalStatus = ApprovalStatus.Rejected;
            profile.RejectionReason = request.Reason;

            await _dbContext.SaveChangesAsync(cancellationToken);

            await _logService.LogAsync(
                AdminId,
                AdminActionType.RejectMechanic,
                AdminTargetType.Mechanic,
                profile.Id.ToString()
            );

            return Unit.Value;
        }
    }
}