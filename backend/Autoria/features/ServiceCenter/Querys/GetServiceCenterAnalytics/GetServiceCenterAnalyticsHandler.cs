using System.Security.Claims;
using Autoria.features.Booking;
using Autoria.features.Payments.Enums;
using Autoria.features.ServiceCenter.Dtos;
using Autoria.features.Subscribtion.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Querys.GetServiceCenterAnalytics
{
    public class GetServiceCenterAnalyticsHandler : IRequestHandler<GetServiceCenterAnalyticsQuery, ServiceCenterAnalyticsDto>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPremiumGuard _premiumGuard;

        public GetServiceCenterAnalyticsHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor, IPremiumGuard premiumGuard)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _premiumGuard = premiumGuard;
        }

        public async Task<ServiceCenterAnalyticsDto> Handle(GetServiceCenterAnalyticsQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var ownsCenter = await _db.ServiceCenters
                .AnyAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken);
            if (!ownsCenter)
                throw new ForbiddenException("You do not own this service center.");

            var now = DateTime.UtcNow;
            var thisMonthStart = new DateTime(now.Year, now.Month, 1);
            var lastMonthStart = thisMonthStart.AddMonths(-1);
            var lastMonthEnd = thisMonthStart;

            var bookings = await _db.Bookings
                .Include(b => b.ServiceType)
                .Where(b => b.ServiceCenterId == request.ServiceCenterId)
                .ToListAsync(cancellationToken);

            var reviews = await _db.Reviews
                .Where(r => r.ServiceCenterId == request.ServiceCenterId)
                .ToListAsync(cancellationToken);

            // ── Basic analytics (Free + Premium) ──────────────────────────────
            var basic = new BasicAnalyticsDto
            {
                TotalBookings = bookings.Count,
                BookingsThisMonth = bookings.Count(b => b.CreatedAt >= thisMonthStart),
                BookingsLastMonth = bookings.Count(b => b.CreatedAt >= lastMonthStart && b.CreatedAt < lastMonthEnd),
                PendingBookings = bookings.Count(b => b.Status == BookingStatus.Pending),
                TotalReviews = reviews.Count,
                AverageRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 1) : 0
            };

            var isPremium = await _premiumGuard.IsPremiumAsync(request.ServiceCenterId, cancellationToken);

            if (!isPremium)
                return new ServiceCenterAnalyticsDto { Basic = basic, Advanced = null };

            // ── Advanced analytics (Premium only) ─────────────────────────────
            var profileViews = await _db.ProfileViews
                .Where(v => v.ServiceCenterId == request.ServiceCenterId)
                .ToListAsync(cancellationToken);

            var viewsThisMonth = profileViews.Count(v => v.ViewedAt >= thisMonthStart);
            var conversionRate = profileViews.Any()
                ? Math.Round((double)bookings.Count / profileViews.Count * 100, 1)
                : 0;

            var topServices = bookings
                .GroupBy(b => b.ServiceType.Name)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => new ServiceTypeStatDto
                {
                    ServiceTypeName = g.Key,
                    BookingCount = g.Count()
                }).ToList();

            var peakDays = bookings
                .GroupBy(b => b.Appointment.DayOfWeek)
                .OrderByDescending(g => g.Count())
                .Select(g => new PeakDayDto
                {
                    DayOfWeek = g.Key.ToString(),
                    BookingCount = g.Count()
                }).ToList();

            var payments = await _db.Payments
                .Where(p => p.BookingId != Guid.Empty &&
                            bookings.Select(b => b.Id).Contains(p.BookingId) &&
                            p.Status == PaymentStatus.Completed)
                .ToListAsync(cancellationToken);

            var monthlyTrend = Enumerable.Range(0, 6).Select(i =>
            {
                var start = thisMonthStart.AddMonths(-i);
                var end = start.AddMonths(1);
                return new MonthlyBookingStatDto
                {
                    Year = start.Year,
                    Month = start.Month,
                    MonthName = start.ToString("MMMM"),
                    BookingCount = bookings.Count(b => b.CreatedAt >= start && b.CreatedAt < end),
                    Revenue = payments.Where(p => p.PaidAt >= start && p.PaidAt < end).Sum(p => p.Amount)
                };
            }).OrderBy(m => m.Year).ThenBy(m => m.Month).ToList();

            var advanced = new AdvancedAnalyticsDto
            {
                ProfileViewsTotal = profileViews.Count,
                ProfileViewsThisMonth = viewsThisMonth,
                ConversionRate = conversionRate,
                TopServices = topServices,
                PeakBookingDays = peakDays,
                MonthlyTrend = monthlyTrend
            };

            return new ServiceCenterAnalyticsDto { Basic = basic, Advanced = advanced };
        }
    }
}
