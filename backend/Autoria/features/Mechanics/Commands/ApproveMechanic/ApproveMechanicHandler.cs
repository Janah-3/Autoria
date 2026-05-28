using Autoria.Infrastructure.Identity.entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.constants;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.Mechanics.Commands.ApproveMechanic
{
    public class ApproveMechanicHandler : IRequestHandler<ApproveMechanicCommand, Unit>
    {
        private readonly AppDbContext _dbContext;
        private readonly UserManager<User> _userManager;
        private readonly IAdminLogService _logService;
        private readonly ICurrentUserService _currentUser;

        public ApproveMechanicHandler(AppDbContext dbContext, UserManager<User> userManager, IAdminLogService logService , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _logService = logService;
            _currentUser= currentUser;
        }

        public async Task<Unit> Handle(ApproveMechanicCommand request, CancellationToken cancellationToken)
        {
            var AdminId = _currentUser.GetUserId();

            var profile = await _dbContext.MechanicProfiles
                .FirstOrDefaultAsync(m => m.Id == request.MechanicId, cancellationToken)
                    ?? throw new NotFoundException("Mechanic not found");

            if (profile.ApprovalStatus != ApprovalStatus.Pending)
                throw new BadRequestException("Only pending mechanics can be approved");

            profile.ApprovalStatus = ApprovalStatus.Approved;
            profile.ApprovedAt = DateTime.UtcNow;

            var user = await _userManager.FindByIdAsync(profile.UserId)
                ?? throw new NotFoundException("User not found");

            if (!await _userManager.IsInRoleAsync(user, Roles.Mechanic))
                await _userManager.AddToRoleAsync(user, Roles.Mechanic);

            await _dbContext.SaveChangesAsync(cancellationToken);

            await _logService.LogAsync(
                AdminId,
                AdminActionType.ApproveMechanic,
                AdminTargetType.Mechanic,
                profile.Id.ToString()
            );

            return Unit.Value;
        }
    }
}