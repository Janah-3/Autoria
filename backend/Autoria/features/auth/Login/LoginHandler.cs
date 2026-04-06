using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Autoria.features.auth.Dtos;
using Autoria.features.user.entity;
using Autoria.Infrastructure.Identity;
using Autoria.Infrastructure.Identity.Contracts;
using Autoria.Infrastructure.Identity.entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Autoria.features.auth.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, AuthResponseDto>
    {
        private readonly UserManager<User> _userManager;
        private readonly IJwtService _jwtService;

        public LoginHandler(UserManager<User> userManager , IJwtService jwtService )
        {
            _userManager = userManager;
            _jwtService = jwtService;
            
        }
        public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            ////login logic

            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                throw new UnauthorizedAccessException("Invalid credentials");

            }

           return await _jwtService.GenerateToken(user);

        }
    }
}
