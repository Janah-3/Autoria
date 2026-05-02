using System.Security.Claims;
using Autoria.features.SpareParts.Dtos;
using Autoria.features.SpareParts.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Queries.GetUserReservations
{
    public class GetUserReservationsHandler : IRequestHandler<GetUserReservationsQuery, PagedResponse<ReservationDto>>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetUserReservationsHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResponse<ReservationDto>> Handle(GetUserReservationsQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var query = _db.PartReservations
                .Include(r => r.SparePart)
                .Include(r => r.ServiceCenter)
                .Where(r => r.ClientId == userId);

            if (request.Status.HasValue)
                query = query.Where(r => r.Status == request.Status.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(r => r.ReservedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<ReservationDto>(
                items.Select(SparePartMapper.ToReservationDto).ToList(),
                totalCount,
                request.Page,
                request.PageSize);
        }
    }
}
