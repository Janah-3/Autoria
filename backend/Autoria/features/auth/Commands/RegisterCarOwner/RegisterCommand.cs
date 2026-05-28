using Autoria.features.auth.Dtos;
using MediatR;

namespace Autoria.features.auth.Commands.register
{
    public record RegisterCommand(
        string FullName,
        string Email,
        string Password,
        string ConfirmPassword,
        string PhoneNumber
        ) : IRequest<AuthResponseDto>;

}
