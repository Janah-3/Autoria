using Autoria.Infrastructure.Identity.entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.auth.Commands.VerifyEmail
{
    public class VerifyEmailHandler : IRequestHandler<VerifyEmailCommand, Unit>
    {
        private readonly UserManager<User> _userManager;

        public VerifyEmailHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }
        public async Task<Unit> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
        {
            var user= await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                throw new Exception("User not found");
            }

            if (user.EmailConfirmed)
            {
                throw new Exception("Email already verified");
            }

            var decodedToken = Uri.UnescapeDataString(request.Token);

            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (!result.Succeeded)
            {
                throw new Exception("Invalid or expired verification token");
            }

            return Unit.Value;

        }
    }
}
