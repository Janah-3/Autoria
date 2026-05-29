using MediatR;

namespace Autoria.features.Booking.Commands.BlockTimeSlot
{
    public record BlockTimeSlotCommand(Guid TimeSlotId) : IRequest;
}
