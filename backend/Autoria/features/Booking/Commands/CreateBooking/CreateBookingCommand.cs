using MediatR;

namespace Autoria.features.Booking.Commands.CreateBooking
{
    public record CreateBookingCommand(
        Guid CarId,
        Guid ServiceCenterId,
        Guid ServiceTypeId,
        Guid TimeSlotId,
        string? Notes
    ) : IRequest<Guid>;
}
