using Autoria.features.Payments.Dtos;
using Autoria.features.Payments.Enums;
using Autoria.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Payments.Queries.GetRevenueStats
{
    public class GetRevenueStatsHandler : IRequestHandler<GetRevenueStatsQuery, RevenueStatsDto>
    {
        private readonly AppDbContext _db;

        public GetRevenueStatsHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<RevenueStatsDto> Handle(GetRevenueStatsQuery request, CancellationToken cancellationToken)
        {
            var query = _db.Payments
                .Include(p => p.Invoice)
                .AsQueryable();

            if (request.ServiceCenterId.HasValue)
                query = query.Where(p => p.Invoice.ServiceCenterId == request.ServiceCenterId.Value);

            if (request.DateFrom.HasValue)
                query = query.Where(p => p.CreatedAt >= request.DateFrom.Value);

            if (request.DateTo.HasValue)
                query = query.Where(p => p.CreatedAt <= request.DateTo.Value);

            var payments = await query.ToListAsync(cancellationToken);

            var completed = payments.Where(p => p.Status == PaymentStatus.Completed).ToList();
            var refunded = payments.Where(p => p.Status == PaymentStatus.Refunded).ToList();

            var totalRevenue = completed.Sum(p => p.Amount);
            var totalRefunded = refunded.Sum(p => p.Amount);

            var dailyBreakdown = completed
                .GroupBy(p => DateOnly.FromDateTime(p.PaidAt ?? p.CreatedAt))
                .OrderBy(g => g.Key)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key,
                    Revenue = g.Sum(p => p.Amount),
                    TransactionCount = g.Count()
                })
                .ToList();

            return new RevenueStatsDto
            {
                TotalRevenue = totalRevenue,
                CardRevenue = completed.Where(p => p.Method == PaymentMethod.Card).Sum(p => p.Amount),
                CashRevenue = completed.Where(p => p.Method == PaymentMethod.Cash).Sum(p => p.Amount),
                TotalRefunded = totalRefunded,
                NetRevenue = totalRevenue - totalRefunded,
                TotalTransactions = payments.Count,
                CompletedCount = completed.Count,
                PendingCount = payments.Count(p => p.Status == PaymentStatus.Pending),
                RefundedCount = refunded.Count,
                FailedCount = payments.Count(p => p.Status == PaymentStatus.Failed),
                DailyBreakdown = dailyBreakdown
            };
        }
    }
}
