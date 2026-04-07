using System.Security.Claims;
using Autoria.features.auth.Dtos;
using Autoria.Infrastructure.Identity.entities;

namespace Autoria.Infrastructure.Identity.Contracts
{
    public interface IJwtService
    {
        Task<AuthResponseDto> GenerateToken(User user);
        ClaimsPrincipal? ValidateToken(string token);
    }
}
