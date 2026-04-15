using System.Security.Claims;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.user.Commands.Ban_user
{
    public class BanUserHandler : IRequestHandler<BanUserCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IAdminLogService _adminLog;
        private readonly IHttpContextAccessor _contextAccessor;

        public BanUserHandler(UserManager<User> userManager, IAdminLogService adminLog ,IHttpContextAccessor contextAccessor)
        {
            _userManager = userManager;
            _adminLog = adminLog;
            _contextAccessor = contextAccessor;
        }
        public async Task<Unit> Handle(BanUserCommand request, CancellationToken cancellationToken)
        {
            var adminId = _contextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

            var userId = request.userId;

            var user = await _userManager.FindByIdAsync(userId)
              ?? throw new NotFoundException("User not found");

            if (user.IsBanned == true)
            {
                throw new BadRequestException("user is already banned");
            }


            user.IsBanned = true;

           var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                throw new BadRequestException("Failed to ban user", errors);
            }

            await _adminLog.LogAsync(adminId, AdminActionType.BanUser, AdminTargetType.User, userId, request.details);

            return Unit.Value;
        }
    }
}
