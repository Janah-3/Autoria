using Autoria.Infrastructure.Email.Contracts;
using Autoria.Infrastructure.Email.Templates;
using Autoria.Infrastructure.Identity.entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Autoria.features.auth.Commands.ResendVerificationEmail
{
    public class ResendVerificationEmailHandler : IRequestHandler<ResendVerificationEmailCommand>
    {
        private readonly IEmailService _emailService;
        private readonly UserManager<User> _userManager;

        public ResendVerificationEmailHandler(IEmailService emailService , UserManager<User> userManager)
        {
            _emailService = emailService;
            _userManager = userManager;
        }
        public async Task Handle(ResendVerificationEmailCommand request, CancellationToken cancellationToken)
        {

            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                throw new Exception("User not found");
            }

          
            if (user.EmailConfirmed)
                throw new ArgumentException("Email already verified");

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var verificationLink = $"https://autoria.com/verify-email?token={Uri.EscapeDataString(token)}&email={user.Email}";

            await _emailService.SendMailAsync(
                to: user.Email!,
                subject: "Verify Your Autoria Email",
                body: EmailTemplates.VerifyEmail(user.FullName, verificationLink)
            );
        }
    }
}
