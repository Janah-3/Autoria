using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Autoria.features.auth.Dtos;
using Autoria.Infrastructure.Identity;
using Autoria.Infrastructure.Identity.Contracts;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Autoria.features.auth.Commands.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, AuthResponseDto>
    {
        private readonly UserManager<User> _userManager;
        private readonly IJwtService _jwtService;

        public LoginHandler(UserManager<User> userManager, IJwtService jwtService)
        {
            _userManager = userManager;
            _jwtService = jwtService;

        }
        public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {

            var user = await _userManager.FindByEmailAsync(request.Email)
            ?? throw new NotFoundException("User not found");


            if (!await _userManager.CheckPasswordAsync(user, request.Password))
            {
                throw new UnauthorizedException("Invalid credentials");

            }

            if (!user.EmailConfirmed)
                throw new ForbiddenException("Please verify your email before logging in");

            if (user.IsBanned)
                throw new ForbiddenException("this account is restricted");

            return await _jwtService.GenerateToken(user);

        }
    }
}
