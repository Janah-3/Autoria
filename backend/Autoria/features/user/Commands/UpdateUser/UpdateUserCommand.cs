using MediatR;

namespace Autoria.features.user.Commands.UpdateUser
{
    public record UpdateUserCommand(
    string? UserId,
    string? FullName,
    string? PhoneNumber,
    string? Role
) : IRequest<Unit>;

}
