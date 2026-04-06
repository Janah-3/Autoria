using Autoria.features.auth.Dtos;
using Autoria.features.user.entity;
using Autoria.Infrastructure.Identity.Contracts;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.auth.register
{
    public class RegisterHandler : IRequestHandler<RegisterCommand,AuthResponseDto>
    {
        private UserManager<User> _userManager;
        private readonly IJwtService _jwt;

        public RegisterHandler(UserManager<User> userManager , IJwtService jwt)
        {
            _userManager = userManager;
           _jwt=jwt;
            
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

            if (existingUser!=null)
            {
                throw new InvalidOperationException("A user with this email already exists.");
            }


            var user = new User
            {
                FullName =request.FullName,
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

            return await _jwt.GenerateToken(user);
        }
    }
}
