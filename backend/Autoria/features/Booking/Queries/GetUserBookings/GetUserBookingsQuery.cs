using Autoria.features.Booking.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Booking.Queries.GetUserBookings
{
    public record GetUserBookingsQuery(
        BookingStatus? StatusFilter = null,
        int Page = 1,
        int PageSize = 10
    ) : IRequest<PagedResponse<BookingSummaryDto>>;
}
