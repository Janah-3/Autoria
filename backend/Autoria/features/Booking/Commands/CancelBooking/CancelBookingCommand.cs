using MediatR;

namespace Autoria.features.Booking.Commands.CancelBooking
{
    public record CancelBookingCommand(
        Guid BookingId,
        string? CancellationReason,
        bool BypassOwnerCheck = false
    ) : IRequest;
}
