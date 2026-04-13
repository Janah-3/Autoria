using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.constants;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.auth.Commands.AddAdmin
{
    // Features/Auth/Commands/AddAdmin/AddAdminHandler.cs
    public class AddAdminHandler : IRequestHandler<AddAdminCommand>
    {
        private readonly UserManager<User> _userManager;

        public AddAdminHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task Handle(AddAdminCommand command, CancellationToken ct)
        {
            var existingUser = await _userManager.FindByEmailAsync(command.Email);
            if (existingUser is not null)
                throw new ConflictException("Email already registered");

            var admin = new User
            {
                FullName = command.FullName,
                Email = command.Email,
                UserName = command.Email,
                PhoneNumber = command.PhoneNumber,
                EmailConfirmed = true,  
            };

            var result = await _userManager.CreateAsync(admin, command.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                throw new BadRequestException("Failed to create admin", errors);
            }

            await _userManager.AddToRoleAsync(admin, Roles.Admin);
        }
    }
}
