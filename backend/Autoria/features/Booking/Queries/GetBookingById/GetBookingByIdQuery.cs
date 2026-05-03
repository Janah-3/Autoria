using Autoria.features.Booking.Dtos;
using MediatR;

namespace Autoria.features.Booking.Queries.GetBookingById
{
    public record GetBookingByIdQuery(
        Guid BookingId,
        bool BypassOwnerCheck = false
    ) : IRequest<BookingDetailDto>;
}
