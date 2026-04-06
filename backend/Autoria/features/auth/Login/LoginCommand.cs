using Autoria.features.auth.Dtos;
using MediatR;

namespace Autoria.features.auth.Login
{
    public record LoginCommand(string Email , string Password):IRequest<AuthResponseDto>;
    
}
