using System.Net;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Exceptions;
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
            var user= await _userManager.FindByEmailAsync(request.Email) ?? throw new BadRequestException("user not found"); ;

          
            if (user.EmailConfirmed)
            {
                throw new BadRequestException("Email already verified");
            }

            var decodedToken = WebUtility.UrlDecode(request.Token)
        .Replace(" ", "+");

            Console.WriteLine("RAW TOKEN:");
            Console.WriteLine(request.Token);

            Console.WriteLine("DECODED TOKEN:");
            Console.WriteLine(decodedToken);

            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    Console.WriteLine(error.Description);
                }

                throw new BadRequestException("Invalid or expired verification token");
            }


            return Unit.Value;

        }
    }
}
