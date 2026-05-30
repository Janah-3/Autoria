using System.Security.Claims;
using Autoria.features.Payments.Dtos;
using Autoria.features.Payments.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Payments.Queries.GetInvoiceByBooking
{
    public class GetInvoiceByBookingHandler : IRequestHandler<GetInvoiceByBookingQuery, InvoiceDto>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetInvoiceByBookingHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<InvoiceDto> Handle(GetInvoiceByBookingQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var invoice = await _db.Invoices
                .Include(i => i.ServiceCenter)
                .Include(i => i.Client)
                .Include(i => i.Items)
                .Include(i => i.Payment)
                .FirstOrDefaultAsync(i => i.BookingId == request.BookingId, cancellationToken)
                ?? throw new NotFoundException("Invoice not found.");

            // Both client and service center owner can view
            var isClient = invoice.ClientId == userId;
            var isOwner = invoice.ServiceCenter.UserId == userId;

            if (!isClient && !isOwner)
                throw new ForbiddenException("You do not have access to this invoice.");

            return PaymentMapper.ToDto(invoice);
        }
    }
}
