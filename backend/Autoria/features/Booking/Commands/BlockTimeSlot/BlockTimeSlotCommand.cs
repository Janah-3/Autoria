using MediatR;

namespace Autoria.features.Booking.Commands.BlockTimeSlot
{
    public record BlockTimeSlotCommand(
        Guid ServiceCenterId,
        DateOnly Date,
        TimeOnly StartTime,
        TimeOnly EndTime
    ) : IRequest<Guid>;
}
