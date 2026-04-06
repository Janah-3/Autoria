namespace Autoria.features.auth.Dtos
{
    public record AuthResponseDto(
       string AccessToken,
       string RefreshToken,
       DateTime ExpiresAt
        );
    
}
