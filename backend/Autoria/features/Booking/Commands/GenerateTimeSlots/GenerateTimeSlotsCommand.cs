using MediatR;

namespace Autoria.features.Booking.Commands.GenerateTimeSlots
{
    public record GenerateTimeSlotsCommand(
        Guid ServiceCenterId,
        DateOnly Date
    ) : IRequest<int>;  // returns number of slots generated
}
