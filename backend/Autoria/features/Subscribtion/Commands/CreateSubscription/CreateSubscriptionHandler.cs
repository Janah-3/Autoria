using System.Security.Claims;
using Autoria.features.Subscribtion.Dtos;
using Autoria.features.Subscribtion.Entities;
using Autoria.features.Subscribtion.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Subscribtion.Commands.CreateSubscription
{
    public class CreateSubscriptionHandler : IRequestHandler<CreateSubscriptionCommand, SubscriptionPaymentDto>
    {
        private const decimal PlanPrice = 1300m;

        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateSubscriptionHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<SubscriptionPaymentDto> Handle(CreateSubscriptionCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var center = await _db.ServiceCenters
                .FirstOrDefaultAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Service center not found.");

            // If already active — extend by 1 month
            var existing = await _db.ServiceCenterSubscriptions
                .FirstOrDefaultAsync(s =>
                    s.ServiceCenterId == request.ServiceCenterId &&
                    s.Plan == SubscriptionPlan.Premium &&
                    s.Status == SubscriptionStatus.Active &&
                    s.EndDate > DateTime.UtcNow, cancellationToken);

            if (existing is not null)
            {
                existing.EndDate = existing.EndDate.AddMonths(1);
                existing.AmountPaid += PlanPrice;
                await _db.SaveChangesAsync(cancellationToken);

                return new SubscriptionPaymentDto
                {
                    SubscriptionId = existing.Id,
                    Amount = PlanPrice,
                    MonthsDuration = 1,
                    Status = SubscriptionStatus.Active,
                    Message = $"Subscription extended by 1 month. New end date: {existing.EndDate:yyyy-MM-dd}."
                };
            }

            // Create new subscription — PendingPayment until paid
            var subscription = new ServiceCenterSubscription
            {
                Id = Guid.NewGuid(),
                ServiceCenterId = request.ServiceCenterId,
                Plan = SubscriptionPlan.Premium,
                Status = SubscriptionStatus.PendingPayment,
                AmountPaid = PlanPrice,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1),
                CreatedAt = DateTime.UtcNow
            };

            _db.ServiceCenterSubscriptions.Add(subscription);
            await _db.SaveChangesAsync(cancellationToken);

            return new SubscriptionPaymentDto
            {
                SubscriptionId = subscription.Id,
                Amount = PlanPrice,
                MonthsDuration = 1,
                Status = SubscriptionStatus.PendingPayment,
                Message = $"Subscription created. Please complete payment of {PlanPrice} LE to activate."
            };
        }
    }
}
