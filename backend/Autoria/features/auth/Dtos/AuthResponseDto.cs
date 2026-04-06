using Autoria.Infrastructure.Identity.entities;

namespace Autoria.features.auth.Dtos
{
    public record AuthResponseDto(
       string AccessToken,
       RefreshToken RefreshToken,
       DateTime ExpiresAt
        );
    
}
