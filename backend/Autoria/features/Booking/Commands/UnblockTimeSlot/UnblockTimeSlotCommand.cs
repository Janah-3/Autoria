using MediatR;

namespace Autoria.features.Booking.Commands.UnblockTimeSlot
{
    public record UnblockTimeSlotCommand(Guid TimeSlotId) : IRequest;
}
