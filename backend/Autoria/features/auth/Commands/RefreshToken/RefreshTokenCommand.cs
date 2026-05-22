using Autoria.features.auth.Dtos;
using MediatR;

namespace Autoria.features.auth.Commands.RefreshToken
{
    public record RefreshTokenCommand(
      string RefreshToken
  ) : IRequest<AuthResponseDto>;
}
