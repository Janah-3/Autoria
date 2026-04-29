using Autoria.features.Booking.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Booking.Queries.GetAllBookings
{
    public record GetAllBookingsQuery(BookingFilterDto Filter) : IRequest<PagedResponse<BookingSummaryAdminDto>>;
}
