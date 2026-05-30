using Autoria.features.Payments.Dtos;
using MediatR;

namespace Autoria.features.Payments.Queries.GetInvoiceByBooking
{
    public record GetInvoiceByBookingQuery(Guid BookingId) : IRequest<InvoiceDto>;
}
