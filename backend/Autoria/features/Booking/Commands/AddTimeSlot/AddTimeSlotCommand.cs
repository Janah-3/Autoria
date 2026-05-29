using MediatR;

namespace Autoria.features.Booking.Commands.AddTimeSlot
{
    public record AddTimeSlotCommand(
        Guid ServiceCenterId,
        DateOnly Date,
        TimeOnly StartTime,
        TimeOnly EndTime
    ) : IRequest<Guid>;
}
