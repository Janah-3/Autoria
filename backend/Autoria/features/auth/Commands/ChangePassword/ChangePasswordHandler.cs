using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Exceptions;
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
    

            var user = await _userManager.GetUserAsync(_httpContextAccessor.HttpContext.User)
                ?? throw new NotFoundException("user not found") ;

            
            var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();

                throw new BadRequestException("Password change failed", errors);
            }

            return ;
        }
    }
}
