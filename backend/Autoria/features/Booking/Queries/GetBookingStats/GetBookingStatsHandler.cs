using Autoria.features.Booking.Dtos;
using Autoria.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Queries.GetBookingStatus
{
    public class GetBookingStatsHandler : IRequestHandler<GetBookingStatsQuery, BookingStatsDto>
    {
        private readonly AppDbContext _db;

        public GetBookingStatsHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<BookingStatsDto> Handle(GetBookingStatsQuery request, CancellationToken cancellationToken)
        {
            var query = _db.Bookings.AsQueryable();

            if (request.DateFrom.HasValue)
                query = query.Where(b => b.CreatedAt >= request.DateFrom.Value);

            if (request.DateTo.HasValue)
                query = query.Where(b => b.CreatedAt <= request.DateTo.Value);

            var bookings = await query.ToListAsync(cancellationToken);
            var completed = bookings.Where(b => b.Status == BookingStatus.Completed).ToList();

            var dailyStats = bookings
                .GroupBy(b => DateOnly.FromDateTime(b.CreatedAt))
                .OrderBy(g => g.Key)
                .Select(g => new DailyBookingStatDto
                {
                    Date = g.Key,
                    Count = g.Count(),
                    Revenue = g.Where(b => b.TotalPrice.HasValue).Sum(b => b.TotalPrice!.Value)
                })
                .ToList();

            return new BookingStatsDto
            {
                TotalBookings = bookings.Count,
                PendingCount = bookings.Count(b => b.Status == BookingStatus.Pending),
                ConfirmedCount = bookings.Count(b => b.Status == BookingStatus.Confirmed),
                CompletedCount = completed.Count,
                CancelledCount = bookings.Count(b => b.Status == BookingStatus.Cancelled),
                TotalRevenue = completed.Sum(b => b.TotalPrice ?? 0),
                AverageBookingValue = completed.Count > 0 ? completed.Average(b => b.TotalPrice ?? 0) : 0,
                DailyStats = dailyStats
            };
        }
    }
}
