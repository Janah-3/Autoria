using MediatR;

namespace Autoria.features.user.Commands.Ban_user
{
    public record BanUserCommand( string userId , string? details) : IRequest<Unit>;
    
}
