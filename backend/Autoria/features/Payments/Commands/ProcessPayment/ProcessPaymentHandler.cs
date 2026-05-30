using System.Security.Claims;
using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.features.Payments.Entities;
using Autoria.features.Payments.Enums;
using Autoria.features.Payments.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Payments.Commands.ProcessPayment
{
    public class ProcessPaymentHandler : IRequestHandler<ProcessPaymentCommand, ProcessPaymentResult>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMockPaymentGateway _paymentGateway;
        private readonly INotificationService _notificationService;

        public ProcessPaymentHandler(
            AppDbContext db,
            IHttpContextAccessor httpContextAccessor,
            IMockPaymentGateway paymentGateway,
            INotificationService notificationService)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _paymentGateway = paymentGateway;
            _notificationService = notificationService;
        }

        public async Task<ProcessPaymentResult> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var invoice = await _db.Invoices
                .Include(i => i.ServiceCenter)
                .Include(i => i.Client)
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId, cancellationToken)
                ?? throw new NotFoundException("Invoice not found.");

            if (invoice.ClientId != userId)
                throw new ForbiddenException("This invoice does not belong to you.");

            if (invoice.Status == InvoiceStatus.Paid)
                throw new BadRequestException("Invoice is already paid.");

            if (invoice.Status == InvoiceStatus.Draft)
                throw new BadRequestException("Invoice has not been issued yet.");

            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                BookingId = invoice.BookingId,
                UserId = userId,
                InvoiceId = invoice.Id,
                Method = request.Method,
                Amount = invoice.TotalAmount,
                CreatedAt = DateTime.UtcNow
            };

            if (request.Method == PaymentMethod.Cash)
            {
                payment.Status = PaymentStatus.Pending;
                payment.Notes = "Cash payment — to be collected at the service center.";

                _db.Payments.Add(payment);
                await _db.SaveChangesAsync(cancellationToken);

                await _notificationService.SendAsync(
                    userId: userId,
                    userEmail: invoice.Client.Email!,
                    type: NotificationType.PaymentPending,
                    channel: NotificationChannel.Both,
                    content: $"Your cash payment of {invoice.TotalAmount:C} to {invoice.ServiceCenter.Name} has been registered. Please pay at the service center.");

                return new ProcessPaymentResult(true, null, "Cash payment registered. Please pay at the service center.");
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.CardToken))
                    throw new BadRequestException("Card token is required for card payments.");

                var gatewayResult = await _paymentGateway.ProcessCardPaymentAsync(invoice.TotalAmount, request.CardToken);

                if (gatewayResult.Success)
                {
                    payment.Status = PaymentStatus.Completed;
                    payment.TransactionId = gatewayResult.TransactionId;
                    payment.PaidAt = DateTime.UtcNow;

                    invoice.Status = InvoiceStatus.Paid;
                    invoice.PaidAt = DateTime.UtcNow;

                    _db.Payments.Add(payment);
                    await _db.SaveChangesAsync(cancellationToken);

                    await _notificationService.SendAsync(
                        userId: userId,
                        userEmail: invoice.Client.Email!,
                        type: NotificationType.PaymentCompleted,
                        channel: NotificationChannel.Both,
                        content: $"Payment of {invoice.TotalAmount:C} to {invoice.ServiceCenter.Name} completed. Transaction ID: {gatewayResult.TransactionId}.");

                    return new ProcessPaymentResult(true, gatewayResult.TransactionId, "Payment completed successfully.");
                }
                else
                {
                    payment.Status = PaymentStatus.Failed;
                    payment.Notes = gatewayResult.FailureReason;

                    _db.Payments.Add(payment);
                    await _db.SaveChangesAsync(cancellationToken);

                    return new ProcessPaymentResult(false, null, gatewayResult.FailureReason ?? "Payment failed.");
                }
            }
        }
    }
}
