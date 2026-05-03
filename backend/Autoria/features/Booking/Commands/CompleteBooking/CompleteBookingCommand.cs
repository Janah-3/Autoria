using MediatR;

namespace Autoria.features.Booking.Commands.CompleteBooking
{
    public record CompleteBookingCommand(
        Guid BookingId,
        decimal? TotalPrice
    ) : IRequest;
}
