using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.user.Commands.UpdateUser
{
    public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IAdminLogService _logService;

        public UpdateUserHandler(UserManager<User> userManager, IAdminLogService logService)
        {
            _userManager = userManager;
            _logService = logService;
        }

        public async Task<Unit> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId)
                ?? throw new NotFoundException("User not found");

            user.FullName = request.FullName ?? user.FullName;
            user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;

            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
                throw new BadRequestException(
                    "Failed to update user",
                    updateResult.Errors.Select(e => e.Description).ToList()
                );

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var currentRoles = await _userManager.GetRolesAsync(user);

                if (currentRoles.Any())
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);

                var roleResult = await _userManager.AddToRoleAsync(user, request.Role);

                if (!roleResult.Succeeded)
                    throw new BadRequestException(
                        "Failed to update user role",
                        roleResult.Errors.Select(e => e.Description).ToList()
                    );
            }

            await _logService.LogAsync(
                request.UserId,
                AdminActionType.UpdateUser,
                AdminTargetType.User,
                user.Id,
                $"Updated user. Role: {request.Role ?? "unchanged"}"
            );

            return Unit.Value;
        }
    }
}
