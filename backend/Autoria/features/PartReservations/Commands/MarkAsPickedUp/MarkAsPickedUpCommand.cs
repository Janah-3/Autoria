using MediatR;

namespace Autoria.features.PartReservations.Commands.MarkAsPickedUp
{
    public record MarkAsPickedUpCommand(Guid ReservationId) : IRequest<Unit>;
}