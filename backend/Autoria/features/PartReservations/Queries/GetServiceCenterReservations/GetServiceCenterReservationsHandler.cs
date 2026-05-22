using Autoria.features.PartReservations.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.PartReservations.Queries.GetServiceCenterReservations
{
    public class GetServiceCenterReservationsHandler : IRequestHandler<GetServiceCenterReservationsQuery, PagedResponse<ReservationDto>>
    {
        private readonly AppDbContext _db;
        private readonly ICurrentUserService _currentUser;

        public GetServiceCenterReservationsHandler(AppDbContext db, ICurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        public async Task<PagedResponse<ReservationDto>> Handle(GetServiceCenterReservationsQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUser.GetUserId();

            var serviceCenter = await _db.ServiceCenters
                .FirstOrDefaultAsync(sc => sc.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Service center not found for this user.");

            var query = _db.PartReservations
                .Include(r => r.SparePart)
                .Where(r => r.ServiceCenterId == serviceCenter.Id);

            if (request.Status.HasValue)
                query = query.Where(r => r.Status == request.Status.Value);

            var total = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(r => r.ReservedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    SparePartName = r.SparePart.Name,
                    ServiceCenterName = serviceCenter.Name,
                    Quantity = r.Quantity,
                    UnitPrice = r.UnitPrice,
                    TotalPrice = r.Quantity * r.UnitPrice,
                    Status = r.Status,
                    BookingId = r.BookingId,
                    ReservedAt = r.ReservedAt,
                    ExpiresAt = r.ExpiresAt,
                    PickedUpAt = r.PickedUpAt,
                    CancelledAt = r.CancelledAt,
                    CancellationReason = r.CancellationReason
                })
                .ToListAsync(cancellationToken);

            return new PagedResponse<ReservationDto>(items, total, request.Page, request.PageSize);
        }
    }
}