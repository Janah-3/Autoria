using MediatR;

namespace Autoria.features.Booking.Commands.RejectBooking
{
    public record RejectBookingCommand(
        Guid BookingId,
        string Reason
    ) : IRequest;
}
