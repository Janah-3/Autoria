using System.Security.Claims;
using Autoria.features.Payments.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Payments.Commands.ConfirmCashPayment
{
    public class ConfirmCashPaymentHandler : IRequestHandler<ConfirmCashPaymentCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ConfirmCashPaymentHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(ConfirmCashPaymentCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var payment = await _db.Payments
                .Include(p => p.Invoice)
                    .ThenInclude(i => i.ServiceCenter)
                .FirstOrDefaultAsync(p => p.Id == request.PaymentId, cancellationToken)
                ?? throw new NotFoundException("Payment not found.");

            if (payment.Invoice.ServiceCenter.UserId != userId)
                throw new ForbiddenException("Only the service center owner can confirm cash payments.");

            if (payment.Method != PaymentMethod.Cash)
                throw new BadRequestException("This payment is not a cash payment.");

            if (payment.Status == PaymentStatus.Completed)
                throw new BadRequestException("Payment is already confirmed.");

            payment.Status = PaymentStatus.Completed;
            payment.PaidAt = DateTime.UtcNow;

            payment.Invoice.Status = InvoiceStatus.Paid;
            payment.Invoice.PaidAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
