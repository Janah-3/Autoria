using System.Text;
using Autoria.Infrastructure.Identity.entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;

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

            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null) {
                throw new Exception("Invalid request");
            }
           if(request.Password ==null || request.ConfirmPassword == null)
            {
                throw new ArgumentException("passwords do not match");

            }

           if(request.Password.Length < 8)
            {
                throw new ArgumentException("password must have at least 8 characters");
            }
            var decodedToken = Encoding.UTF8.GetString(
            WebEncoders.Base64UrlDecode(request.Token)
            );

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.Password);

            if (!result.Succeeded)
                throw new Exception(
                    string.Join(",", result.Errors.Select(e => e.Description))
                );

            return Unit.Value;
        }
    }
}
