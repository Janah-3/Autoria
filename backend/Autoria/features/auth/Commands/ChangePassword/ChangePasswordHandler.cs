using Autoria.Infrastructure.Identity.entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.auth.Commands.ChangePassword
{
    public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand>
    {
        private readonly UserManager<User> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ChangePasswordHandler(UserManager<User>  userManager , IHttpContextAccessor httpContextAccessor)
        {
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            if (request.NewPassword != request.ConfirmPassword)
                throw new Exception("New password and confirmation do not match.");


            var user = await _userManager.GetUserAsync(_httpContextAccessor.HttpContext.User);

          
            if (user == null)
                throw new Exception("User not found.");

            
            var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new Exception($"Password change failed: {errors}");
            }

            return ;
        }
    }
}
