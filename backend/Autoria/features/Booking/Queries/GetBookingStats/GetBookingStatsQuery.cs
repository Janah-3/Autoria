using Autoria.features.Booking.Dtos;
using MediatR;

namespace Autoria.features.Booking.Queries.GetBookingStatus
{
    public record GetBookingStatsQuery(
        DateTime? DateFrom = null,
        DateTime? DateTo = null
    ) : IRequest<BookingStatsDto>;
}
