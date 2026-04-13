using System.Text;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Autoria.features.auth.Commands.ResetPassword
{
    public class ResetPassHandler : IRequestHandler<ResetPassCommand, Unit>
    {
        private readonly UserManager<User> _userManager;

        public ResetPassHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }
        public async Task<Unit> Handle(ResetPassCommand request, CancellationToken cancellationToken)
        {

            var user = await _userManager.FindByEmailAsync(request.Email)?? throw new UnauthorizedAccessException("unauthorized user");

            var decodedToken = Encoding.UTF8.GetString(
            WebEncoders.Base64UrlDecode(request.Token)
            );

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.Password);

            if (!result.Succeeded)
            {

                var errors = result.Errors.Select(e => e.Description).ToList();

                throw new BadRequestException("User creation failed", errors);
            }

            return Unit.Value;
        }
    }
}
