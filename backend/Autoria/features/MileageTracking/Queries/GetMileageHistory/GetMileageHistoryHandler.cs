using System.Security.Claims;
using Autoria.features.MileageTracking.Dtos;
using Autoria.features.MileageTracking.Mappers;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.MileageTracking.Queries.GetMileageHistory
{
    public class GetMileageHistoryHandler : IRequestHandler<GetMileageHistoryQuery, PagedResponse<MileageEntryDto>>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetMileageHistoryHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResponse<MileageEntryDto>> Handle(GetMileageHistoryQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var carExists = await _db.Cars
                .AnyAsync(c => c.CarId == request.CarId && c.UserId == userId, cancellationToken);
            if (!carExists)
                throw new NotFoundException("Car not found or does not belong to the current user.");

            var query = _db.MileageEntries
                .Include(e => e.Car)
                .Where(e => e.CarId == request.CarId);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(e => e.LoggedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<MileageEntryDto>(
                items.Select(MileageMapper.ToDto).ToList(),
                totalCount,
                request.Page,
                request.PageSize);
        }
    }
}
