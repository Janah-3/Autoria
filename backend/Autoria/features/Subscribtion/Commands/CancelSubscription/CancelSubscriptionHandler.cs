using System.Security.Claims;
using Autoria.features.Subscribtion.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Subscribtion.Commands.CancelSubscription
{
    public class CancelSubscriptionHandler : IRequestHandler<CancelSubscriptionCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CancelSubscriptionHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(CancelSubscriptionCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var ownsCenter = await _db.ServiceCenters
                .AnyAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken);
            if (!ownsCenter)
                throw new ForbiddenException("You do not own this service center.");

            var sub = await _db.ServiceCenterSubscriptions
                .FirstOrDefaultAsync(s =>
                    s.ServiceCenterId == request.ServiceCenterId &&
                    s.Status == SubscriptionStatus.Active, cancellationToken)
                ?? throw new NotFoundException("No active subscription found.");

            if (sub.Plan == SubscriptionPlan.Free)
                throw new BadRequestException("Free plan cannot be cancelled.");

            // Stays active until EndDate, but won't auto-renew
            sub.Status = SubscriptionStatus.Cancelled;
            sub.CancelledAt = DateTime.UtcNow;
            sub.CancellationReason = request.CancellationReason;

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
