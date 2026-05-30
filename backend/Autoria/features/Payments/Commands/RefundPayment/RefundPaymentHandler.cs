using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.features.Payments.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Payments.Commands.RefundPayment
{
    public class RefundPaymentHandler : IRequestHandler<RefundPaymentCommand>
    {
        private readonly AppDbContext _db;
        private readonly INotificationService _notificationService;

        public RefundPaymentHandler(AppDbContext db, INotificationService notificationService)
        {
            _db = db;
            _notificationService = notificationService;
        }

        public async Task Handle(RefundPaymentCommand request, CancellationToken cancellationToken)
        {
            var payment = await _db.Payments
                .Include(p => p.Invoice)
                    .ThenInclude(i => i.ServiceCenter)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == request.PaymentId, cancellationToken)
                ?? throw new NotFoundException("Payment not found.");

            if (payment.Status != PaymentStatus.Completed)
                throw new BadRequestException("Only completed payments can be refunded.");

            // Mock refund — in real integration: call gateway refund API here
            payment.Status = PaymentStatus.Refunded;
            payment.RefundReason = request.Reason;
            payment.RefundedAt = DateTime.UtcNow;

            payment.Invoice.Status = InvoiceStatus.Draft; // reset invoice
            payment.Invoice.PaidAt = null;

            await _db.SaveChangesAsync(cancellationToken);

            await _notificationService.SendAsync(
                userId: payment.UserId,
                userEmail: payment.User.Email!,
                type: NotificationType.PaymentRefunded,
                channel: NotificationChannel.Both,
                content: $"Your payment of {payment.Amount:C} to {payment.Invoice.ServiceCenter.Name} has been refunded. Reason: {request.Reason}");
        }
    }
}
