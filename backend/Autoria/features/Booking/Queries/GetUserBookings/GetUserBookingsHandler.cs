using System.Security.Claims;
using Autoria.features.Booking.Dtos;
using Autoria.features.Booking.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Queries.GetUserBookings
{

    public class GetUserBookingsHandler : IRequestHandler<GetUserBookingsQuery, PagedResponse<BookingSummaryDto>>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetUserBookingsHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResponse<BookingSummaryDto>> Handle(GetUserBookingsQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var query = _db.Bookings
                .Include(b => b.Car)
                .Include(b => b.ServiceCenter)
                .Include(b => b.ServiceType)
                .Where(b => b.UserId == userId);

            if (request.StatusFilter.HasValue)
                query = query.Where(b => b.Status == request.StatusFilter.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var bookings = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<BookingSummaryDto>(
                bookings.Select(BookingMapper.ToSummaryDto).ToList(),
                totalCount,
                request.Page,
                request.PageSize);
        }
    }
}
