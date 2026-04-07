using MediatR;

namespace Autoria.features.auth.Commands.VerifyEmail
{
    public record VerifyEmailCommand(
    string Email,
    string Token
) : IRequest<Unit>;
}
