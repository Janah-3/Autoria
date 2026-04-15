using MediatR;

namespace Autoria.features.user.Commands.DeleteUser
{
    public record DeleteUserCommand(
        string UserId
        ): IRequest<Unit>;
    
}
