using MediatR;

namespace Autoria.features.Booking.Commands.RescheduleBooking
{
    public record RescheduleBookingCommand(
        Guid BookingId,
        Guid NewTimeSlotId
    ) : IRequest;
}
