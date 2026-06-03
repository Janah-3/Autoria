using System.Security.Claims;
using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.features.Payments.Enums;
using Autoria.features.Payments.Services;
using Autoria.features.Subscribtion.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Subscribtion.Commands.PaySubscription
{
    public class PaySubscriptionHandler : IRequestHandler<PaySubscriptionCommand, PaySubscriptionResult>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMockPaymentGateway _paymentGateway;
        private readonly INotificationService _notificationService;

        public PaySubscriptionHandler(
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

        public async Task<PaySubscriptionResult> Handle(PaySubscriptionCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var subscription = await _db.ServiceCenterSubscriptions
                .Include(s => s.ServiceCenter)
                    .ThenInclude(sc => sc.User)
                .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken)
                ?? throw new NotFoundException("Subscription not found.");

            if (subscription.ServiceCenter.UserId != userId)
                throw new ForbiddenException("You do not own this service center.");

            if (subscription.Status != SubscriptionStatus.PendingPayment)
                throw new BadRequestException("This subscription is not awaiting payment.");

            if (string.IsNullOrWhiteSpace(request.CardToken))
                throw new BadRequestException("Card token is required.");

            var gatewayResult = await _paymentGateway.ProcessCardPaymentAsync(
                subscription.AmountPaid,
                request.CardToken);

            if (!gatewayResult.Success)
                return new PaySubscriptionResult(false, null, gatewayResult.FailureReason ?? "Payment failed.");

            subscription.Status = SubscriptionStatus.Active;
            subscription.TransactionId = gatewayResult.TransactionId;
            subscription.StartDate = DateTime.UtcNow;
            subscription.EndDate = DateTime.UtcNow.AddMonths(1);

            await _db.SaveChangesAsync(cancellationToken);

            await _notificationService.SendAsync(
                userId: userId,
                userEmail: subscription.ServiceCenter.User.Email!,
                type: NotificationType.SubscriptionActivated,
                channel: NotificationChannel.Both,
                content: $"Your Premium subscription for {subscription.ServiceCenter.Name} is now active until {subscription.EndDate:dd MMM yyyy}.");

            return new PaySubscriptionResult(
                true,
                gatewayResult.TransactionId,
                $"Payment successful. Premium plan activated until {subscription.EndDate:dd MMM yyyy}.");
        }
    }
}
