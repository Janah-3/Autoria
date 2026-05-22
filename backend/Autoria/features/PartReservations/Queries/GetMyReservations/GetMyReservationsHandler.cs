using Autoria.features.PartReservations.Dtos;
using Autoria.features.PartReservations.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.PartReservations.Queries.GetMyReservations
{
    public class GetMyReservationsHandler : IRequestHandler<GetMyReservationsQuery, PagedResponse<ReservationDto>>
    {
        private readonly AppDbContext _db;
        private readonly ICurrentUserService _currentUser;

        public GetMyReservationsHandler(AppDbContext db, ICurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        public async Task<PagedResponse<ReservationDto>> Handle(GetMyReservationsQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUser.GetUserId();

            var query = _db.PartReservations
                .Include(r => r.SparePart)
                .Include(r => r.ServiceCenter)
                .Where(r => r.ClientId == userId);

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
                    ServiceCenterName = r.ServiceCenter.Name,
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