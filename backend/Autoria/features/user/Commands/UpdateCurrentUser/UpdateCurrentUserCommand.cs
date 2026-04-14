using MediatR;

namespace Autoria.features.user.Commands.UpdateCurrentUser
{
    public record UpdateCurrentUserCommand(
     string? FullName,
     string? PhoneNumber 
        ): IRequest<Unit>;
}
