using Autoria.features.auth.Dtos;
using Autoria.Infrastructure.Email.Contracts;
using Autoria.Infrastructure.Email.Services;
using Autoria.Infrastructure.Email.Templates;
using Autoria.Infrastructure.Identity.Contracts;
using Autoria.Infrastructure.Identity.entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.auth.Commands.register
{
    public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
    {
        private UserManager<User> _userManager;
        private readonly IJwtService _jwt;
        private readonly IEmailService _emailService;

        public RegisterHandler(UserManager<User> userManager, IJwtService jwt, IEmailService emailService)
        {
            _userManager = userManager;
            _jwt = jwt;
            _emailService = emailService;

        }

        public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {

            if (string.IsNullOrWhiteSpace(request.FullName) ||
               string.IsNullOrWhiteSpace(request.Email) ||
               string.IsNullOrWhiteSpace(request.PhoneNumber) ||
               string.IsNullOrWhiteSpace(request.Password) ||
               string.IsNullOrWhiteSpace(request.ConfirmPassword)
                )
            {
                throw new ArgumentException("fields are required.");
            }


            if (request.Password != request.ConfirmPassword)
            {
                throw new ArgumentException("Passwords do not match.");
            }

            var existingUser = await _userManager.FindByEmailAsync(request.Email);

            if (existingUser != null)
            {
                throw new InvalidOperationException("A user with this email already exists.");
            }


            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Created_At = DateTime.UtcNow,
                IsBanned = false,
                EmailConfirmed = false
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {

                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"User creation failed: {errors}");
            }

            await _userManager.AddToRoleAsync(user, "User");

            var verificationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var verificationLink = $"https://autoria.com/verify-email?token={Uri.EscapeDataString(verificationToken)}&email={user.Email}";

            await _emailService.SendMailAsync(
                to: user.Email,
                subject: "Verify Your Autoria Email",
                body: EmailTemplates.VerifyEmail(user.FullName, verificationLink)

                );


            return await _jwt.GenerateToken(user);
        }
    }
}
