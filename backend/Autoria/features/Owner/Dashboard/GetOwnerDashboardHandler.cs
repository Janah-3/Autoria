using System.Security.Claims;
using Autoria.features.Booking;
using Autoria.features.Owner.Dashboard.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Owner.Dashboard
{
    public class GetOwnerDashboardHandler : IRequestHandler<GetOwnerDashboardQuery, OwnerDashboardDto>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetOwnerDashboardHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<OwnerDashboardDto> Handle(GetOwnerDashboardQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var center = await _db.ServiceCenters
                .Include(sc => sc.OperatingHours)
                .FirstOrDefaultAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Service center not found.");

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var todayDate = today.ToDateTime(TimeOnly.MinValue);
            var weekAgo = DateTime.UtcNow.AddDays(-7);

            // ── Today's bookings ───────────────────────────────────────────────
            var todayBookings = await _db.Bookings
                .Include(b => b.User)
                .Include(b => b.Car)
                .Include(b => b.ServiceType)
                .Where(b =>
                    b.ServiceCenterId == request.ServiceCenterId &&
                    b.Appointment.Date == todayDate.Date)
                .OrderBy(b => b.Appointment)
                .ToListAsync(cancellationToken);

            // ── Pending requests (all time, not just today) ────────────────────
            var pendingCount = await _db.Bookings
                .CountAsync(b =>
                    b.ServiceCenterId == request.ServiceCenterId &&
                    b.Status == BookingStatus.Pending, cancellationToken);

            // ── Reviews ────────────────────────────────────────────────────────
            var reviews = await _db.Reviews
                .Where(r => r.ServiceCenterId == request.ServiceCenterId)
                .ToListAsync(cancellationToken);

            var newReviewsThisWeek = reviews.Count(r => r.CreatedAt >= weekAgo);
            var avgRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

            // ── Is open today ──────────────────────────────────────────────────
            var todayHours = center.OperatingHours
                .FirstOrDefault(oh => oh.Day == DateTime.UtcNow.DayOfWeek);
            var isOpenToday = todayHours is not null && !todayHours.IsClosed;

            // ── Recent activity (last 20 events) ──────────────────────────────
            var recentBookings = await _db.Bookings
                .Include(b => b.User)
                .Where(b =>
                    b.ServiceCenterId == request.ServiceCenterId &&
                    b.CreatedAt >= weekAgo)
                .OrderByDescending(b => b.CreatedAt)
                .Take(10)
                .ToListAsync(cancellationToken);

            var recentReviews = await _db.Reviews
                .Include(r => r.User)
                .Where(r =>
                    r.ServiceCenterId == request.ServiceCenterId &&
                    r.CreatedAt >= weekAgo)
                .OrderByDescending(r => r.CreatedAt)
                .Take(10)
                .ToListAsync(cancellationToken);

            var activity = new List<ActivityItemDto>();

            foreach (var b in recentBookings)
            {
                if (b.Status == BookingStatus.Pending)
                {
                    activity.Add(new ActivityItemDto
                    {
                        Type = "NewBooking",
                        Message = $"New booking request from {b.User.FullName}",
                        ReferenceId = b.Id,
                        OccurredAt = b.CreatedAt
                    });
                }
                else if (b.Status == BookingStatus.Cancelled)
                {
                    activity.Add(new ActivityItemDto
                    {
                        Type = "BookingCancelled",
                        Message = $"Booking cancelled by {b.User.FullName}",
                        ReferenceId = b.Id,
                        OccurredAt = b.CreatedAt
                    });
                }
            }

            foreach (var r in recentReviews)
            {
                activity.Add(new ActivityItemDto
                {
                    Type = "NewReview",
                    Message = $"New {r.Rating}-star review from {r.User.FullName}",
                    ReferenceId = r.Id,
                    OccurredAt = r.CreatedAt
                });
            }

            // Sort combined activity by most recent
            activity = activity
                .OrderByDescending(a => a.OccurredAt)
                .Take(10)
                .ToList();

            // ── Map today's appointments ───────────────────────────────────────
            var todayAppointments = todayBookings.Select(b => new TodayAppointmentDto
            {
                BookingId = b.Id,
                AppointmentTime = TimeOnly.FromDateTime(b.Appointment),
                ClientName = b.User.FullName,
                ServiceTypeName = b.ServiceType.Name,
                CarMake = b.Car.Make,
                CarModel = b.Car.Model,
                Status = b.Status
            }).ToList();

            return new OwnerDashboardDto
            {
                IsOpenToday = isOpenToday,
                Metrics = new DashboardMetricsDto
                {
                    TodayBookingsTotal = todayBookings.Count,
                    TodayConfirmed = todayBookings.Count(b => b.Status == BookingStatus.Confirmed),
                    TodayPending = todayBookings.Count(b => b.Status == BookingStatus.Pending),
                    PendingRequestsTotal = pendingCount,
                    TotalReviews = reviews.Count,
                    NewReviewsThisWeek = newReviewsThisWeek,
                    AverageRating = Math.Round(avgRating, 1)
                },
                TodayAppointments = todayAppointments,
                RecentActivity = activity
            };
        }
    }
}
