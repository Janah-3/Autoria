using MediatR;

namespace Autoria.features.SpareParts.Commands.CancelReservation
{
    public record CancelReservationCommand(
        Guid ReservationId,
        string? CancellationReason = null
    ) : IRequest;
}
