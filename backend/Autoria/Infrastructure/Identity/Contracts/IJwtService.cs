using System.Security.Claims;
using Autoria.features.auth.Dtos;
using Autoria.features.user.entity;

namespace Autoria.Infrastructure.Identity.Contracts
{
    public interface IJwtService
    {
        Task<AuthResponseDto> GenerateToken(User user);
        ClaimsPrincipal? ValidateToken(string token);
    }
}
