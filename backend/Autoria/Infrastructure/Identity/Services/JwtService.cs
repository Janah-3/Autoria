using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Autoria.features.auth.Dtos;
using Autoria.Infrastructure.Identity.Contracts;
using Autoria.Infrastructure.Identity.entities;
using Autoria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Autoria.Infrastructure.Identity.Services
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _settings;
        private readonly UserManager<User> _userManager;
        private readonly AppDbContext _dbContext;

        public JwtService(IOptions<JwtSettings> settings, UserManager<User> userManager, AppDbContext dbContext)
        {
            _settings = settings.Value;
            _userManager = userManager;
            _dbContext = dbContext;
        }

        public async Task<AuthResponseDto> GenerateToken(User user)
        {
            var claims = new List<Claim>()
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Email, user.Email!)
    };

            var roles = await _userManager.GetRolesAsync(user);

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_settings.Secret));

            var cred = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddMinutes(60);

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: cred);

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);



            var refreshToken = new RefreshToken
            {
                id = Guid.NewGuid(),
                token = Guid.NewGuid().ToString(), 
                ExpiresAt = DateTime.UtcNow.AddDays(7), 
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };
          
                
             _dbContext.RefreshTokens.Add(refreshToken);
             await _dbContext.SaveChangesAsync();



            return new AuthResponseDto(
                accessToken,
                refreshToken,
                expires
            );
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var TokenHandler = new JwtSecurityTokenHandler();

            var key = Encoding.UTF8.GetBytes(_settings.Secret);

            try
            {
                var principal = TokenHandler.ValidateToken(
                    token,
                    new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = _settings.Issuer,

                        ValidateAudience = true,
                        ValidAudience = _settings.Audience,

                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey =
                            new SymmetricSecurityKey(key),

                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    },
                    out _);

                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}
