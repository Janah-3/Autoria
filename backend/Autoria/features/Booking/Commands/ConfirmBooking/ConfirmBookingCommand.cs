using MediatR;

namespace Autoria.features.Booking.Commands.ConfirmBooking
{
    public record ConfirmBookingCommand(Guid BookingId) : IRequest;
}
