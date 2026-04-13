using System.Text;
using Autoria.Infrastructure.Email.Contracts;
using Autoria.Infrastructure.Email.Templates;
using Autoria.Infrastructure.Identity.entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Autoria.features.auth.Commands.forgetPassword
{
    public class ForgetPassHandler : IRequestHandler<ForgetPassCommand,Unit>
    {
        private readonly UserManager<User> _userManager;
        private readonly IEmailService _emailService;

        public ForgetPassHandler(UserManager<User> userManager , IEmailService emailService)
        {
            _userManager = userManager;
            _emailService = emailService;
        }

        async Task<Unit> IRequestHandler<ForgetPassCommand, Unit>.Handle(ForgetPassCommand request, CancellationToken cancellationToken)
        {

            var User = await _userManager.FindByEmailAsync(request.Email)?? throw new UnauthorizedAccessException("email doesn't exist");

            var token = await _userManager.GeneratePasswordResetTokenAsync(User);
            var encodedToken = WebEncoders.Base64UrlEncode(
            Encoding.UTF8.GetBytes(token)
            );

            var resetLink = $"https://autoria.com/reset-password?token={encodedToken}&email={request.Email}";

            await _emailService.SendMailAsync(
                to: User.Email!,
                subject: "Reset Your Autoria Password",
                body: EmailTemplates.ForgotPassword(User.FullName, resetLink)
            );
         
            return Unit.Value;
        }
    }
}
