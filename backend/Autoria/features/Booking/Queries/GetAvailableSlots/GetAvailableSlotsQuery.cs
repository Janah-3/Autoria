using Autoria.features.Booking.Dtos;
using MediatR;

namespace Autoria.features.Booking.Queries.GetAvailableSlots
{
    public record GetAvailableSlotsQuery(
        Guid ServiceCenterId,
        DateOnly Date
    ) : IRequest<List<TimeSlotDto>>;
}
