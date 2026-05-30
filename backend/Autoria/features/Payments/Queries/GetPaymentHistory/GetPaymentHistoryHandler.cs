using System.Security.Claims;
using Autoria.features.Payments.Dtos;
using Autoria.features.Payments.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Payments.Queries.GetPaymentHistory
{
    public class GetPaymentHistoryHandler : IRequestHandler<GetPaymentHistoryQuery, PagedResponse<PaymentDto>>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetPaymentHistoryHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResponse<PaymentDto>> Handle(GetPaymentHistoryQuery request, CancellationToken cancellationToken)
        {
            var query = _db.Payments
                .Include(p => p.Invoice)
                .AsQueryable();

            if (request.CurrentUserOnly)
            {
                var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? throw new UnauthorizedException("User not authenticated.");
                query = query.Where(p => p.UserId == userId);
            }

            if (request.ServiceCenterId.HasValue)
                query = query.Where(p => p.Invoice.ServiceCenterId == request.ServiceCenterId.Value);

            if (request.Method.HasValue)
                query = query.Where(p => p.Method == request.Method.Value);

            if (request.Status.HasValue)
                query = query.Where(p => p.Status == request.Status.Value);

            if (request.DateFrom.HasValue)
                query = query.Where(p => p.CreatedAt >= request.DateFrom.Value);

            if (request.DateTo.HasValue)
                query = query.Where(p => p.CreatedAt <= request.DateTo.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<PaymentDto>(
                items.Select(PaymentMapper.ToPaymentDto).ToList(),
                totalCount,
                request.Page,
                request.PageSize);
        }
    }
}
