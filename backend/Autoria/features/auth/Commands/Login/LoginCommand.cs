using Autoria.features.auth.Dtos;
using MediatR;

namespace Autoria.features.auth.Commands.Login
{
    public record LoginCommand(string Email, string Password) : IRequest<AuthResponseDto>;

}
