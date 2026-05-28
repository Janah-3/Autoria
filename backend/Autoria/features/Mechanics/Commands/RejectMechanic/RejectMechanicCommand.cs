using MediatR;

namespace Autoria.Features.Mechanics.Commands.RejectMechanic
{
    public record RejectMechanicCommand(Guid MechanicId, string Reason) : IRequest<Unit>;
}