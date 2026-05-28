using MediatR;

namespace Autoria.Features.Mechanics.Commands.ApproveMechanic
{
    public record ApproveMechanicCommand(Guid MechanicId) : IRequest<Unit>;
}