using System.Security.Claims;
using Autoria.features.Subscribtion.Dtos;
using Autoria.features.Subscribtion.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Subscribtion.Queries.GetSubscriptionStatus
{
    public class GetSubscriptionStatusHandler : IRequestHandler<GetSubscriptionStatusQuery, SubscriptionStatusDto>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetSubscriptionStatusHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<SubscriptionStatusDto> Handle(GetSubscriptionStatusQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var ownsCenter = await _db.ServiceCenters
                .AnyAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken);
            if (!ownsCenter)
                throw new ForbiddenException("You do not own this service center.");

            var sub = await _db.ServiceCenterSubscriptions
                .Where(s => s.ServiceCenterId == request.ServiceCenterId && s.Status == SubscriptionStatus.Active)
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync(cancellationToken);

            // No subscription = Free plan
            if (sub is null)
            {
                return new SubscriptionStatusDto
                {
                    Plan = SubscriptionPlan.Free,
                    Status = SubscriptionStatus.Active,
                    IsPremium = false,
                    AmountPaid = 0,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.MaxValue,
                    DaysRemaining = int.MaxValue
                };
            }

            var isPremium = sub.Plan == SubscriptionPlan.Premium && sub.EndDate > DateTime.UtcNow;
            var daysRemaining = Math.Max(0, (int)(sub.EndDate - DateTime.UtcNow).TotalDays);

            return new SubscriptionStatusDto
            {
                SubscriptionId = sub.Id,
                Plan = sub.Plan,
                Status = sub.Status,
                IsPremium = isPremium,
                AmountPaid = sub.AmountPaid,
                StartDate = sub.StartDate,
                EndDate = sub.EndDate,
                DaysRemaining = daysRemaining
            };
        }
    }
}
