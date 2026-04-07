using MediatR;

namespace Autoria.features.auth.Commands.ResendVerificationEmail
{
    public record ResendVerificationEmailCommand(string Email) : IRequest;
}
