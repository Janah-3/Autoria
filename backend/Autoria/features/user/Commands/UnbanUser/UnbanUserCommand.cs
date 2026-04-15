using MediatR;

namespace Autoria.features.user.Commands.UnbanUser
{
    public record UnbanUserCommand(string UserId): IRequest<Unit>;
    
}
