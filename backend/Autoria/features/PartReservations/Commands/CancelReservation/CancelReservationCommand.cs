using MediatR;

namespace Autoria.features.PartReservations.Commands.CancelReservation
{
    public record CancelReservationCommand(Guid ReservationId, string? Reason) : IRequest<Unit>;
}