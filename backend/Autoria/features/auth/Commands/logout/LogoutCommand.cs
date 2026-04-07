using MediatR;

namespace Autoria.features.auth.Commands.logout
{
    public record LogoutCommand(
      string RefreshToken
  ) : IRequest<Unit>;
}
