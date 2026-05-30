using System.Security.Claims;
using Autoria.features.Subscribtion.Entities;
using Autoria.features.Subscribtion.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Subscribtion.Commands.CreateSubscription
{
    public class CreateSubscriptionHandler : IRequestHandler<CreateSubscriptionCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        // Pricing tiers
        private static readonly Dictionary<int, decimal> Pricing = new()
    {
        { 1,  299m  },
        { 3,  799m  },   // ~11% off
        { 6,  1499m },   // ~16% off
        { 12, 2799m }    // ~22% off
    };

        public CreateSubscriptionHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(CreateSubscriptionCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var center = await _db.ServiceCenters
                .FirstOrDefaultAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Service center not found.");

            if (!Pricing.TryGetValue(request.MonthsDuration, out var price))
                throw new BadRequestException("Invalid subscription duration. Choose 1, 3, 6, or 12 months.");

            // Check for existing active premium subscription
            var existing = await _db.ServiceCenterSubscriptions
                .FirstOrDefaultAsync(s =>
                    s.ServiceCenterId == request.ServiceCenterId &&
                    s.Plan == SubscriptionPlan.Premium &&
                    s.Status == SubscriptionStatus.Active &&
                    s.EndDate > DateTime.UtcNow, cancellationToken);

            DateTime startDate;
            if (existing is not null)
            {
                // Extend existing subscription
                startDate = existing.EndDate;
                existing.EndDate = existing.EndDate.AddMonths(request.MonthsDuration);
                await _db.SaveChangesAsync(cancellationToken);
                return existing.Id;
            }
            else
            {
                startDate = DateTime.UtcNow;
            }

            var subscription = new ServiceCenterSubscription
            {
                Id = Guid.NewGuid(),
                ServiceCenterId = request.ServiceCenterId,
                Plan = SubscriptionPlan.Premium,
                Status = SubscriptionStatus.Active,
                AmountPaid = price,
                StartDate = startDate,
                EndDate = startDate.AddMonths(request.MonthsDuration),
                CreatedAt = DateTime.UtcNow
            };

            _db.ServiceCenterSubscriptions.Add(subscription);
            await _db.SaveChangesAsync(cancellationToken);

            return subscription.Id;
        }
    }
}
