using Autoria.features.user.Commands.Ban_user;
using Autoria.Infrastructure.Identity.entities;
using Autoria.Infrastructure.Persistence.Entities;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.user.Commands.UnbanUser
{
    public class UnbanUserHandler : IRequestHandler<UnbanUserCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IAdminLogService _adminLog;
        private readonly IHttpContextAccessor _contextAccessor;

        public UnbanUserHandler(UserManager<User> userManager, IAdminLogService adminLog, IHttpContextAccessor contextAccessor)
        {
            _userManager = userManager;
            _adminLog = adminLog;
            _contextAccessor = contextAccessor;
        }
        public async Task<Unit> Handle(UnbanUserCommand request, CancellationToken cancellationToken)
        {
            var adminId = _contextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

            var userId = request.UserId;

            var user = await _userManager.FindByIdAsync(userId)
              ?? throw new NotFoundException("User not found");

            if (user.IsBanned == false)
            {
                throw new BadRequestException("user is not banned");
            }


            user.IsBanned = false;
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                throw new BadRequestException("Failed to unban user", errors);
            }

            await _adminLog.LogAsync(adminId, AdminActionType.UnbanUser, AdminTargetType.User, userId);

            return Unit.Value;
        }
    }
}
