using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Subscribtion.Services
{
    public class PremiumGuard : IPremiumGuard
    {
        private readonly AppDbContext _db;

        public PremiumGuard(AppDbContext db)
        {
            _db = db;
        }

        public async Task<bool> IsPremiumAsync(Guid serviceCenterId, CancellationToken cancellationToken = default)
        {
            return await _db.ServiceCenterSubscriptions.AnyAsync(s =>
                s.ServiceCenterId == serviceCenterId &&
                s.Plan == Enums.SubscriptionPlan.Premium &&
                s.Status == Enums.SubscriptionStatus.Active &&
                s.EndDate > DateTime.UtcNow, cancellationToken);
        }

        public async Task EnsurePremiumAsync(Guid serviceCenterId, CancellationToken cancellationToken = default)
        {
            var isPremium = await IsPremiumAsync(serviceCenterId, cancellationToken);
            if (!isPremium)
                throw new ForbiddenException("This feature requires a Premium subscription. Upgrade at api/subscriptions/plans.");
        }
    }
}
