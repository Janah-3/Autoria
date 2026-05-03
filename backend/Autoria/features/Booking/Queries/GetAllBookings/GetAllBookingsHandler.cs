using Autoria.features.Booking.Dtos;
using Autoria.features.Booking.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Queries.GetAllBookings
{
    public class GetAllBookingsHandler : IRequestHandler<GetAllBookingsQuery, PagedResponse<BookingSummaryAdminDto>>
    {
        private readonly AppDbContext _db;

        public GetAllBookingsHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResponse<BookingSummaryAdminDto>> Handle(GetAllBookingsQuery request, CancellationToken cancellationToken)
        {
            var f = request.Filter;

            var query = _db.Bookings
                .Include(b => b.User)
                .Include(b => b.Car)
                .Include(b => b.ServiceCenter)
                .Include(b => b.ServiceType)
                .AsQueryable();

            if (f.Status.HasValue)
                query = query.Where(b => b.Status == f.Status.Value);

            if (f.ServiceCenterId.HasValue)
                query = query.Where(b => b.ServiceCenterId == f.ServiceCenterId.Value);

            if (f.DateFrom.HasValue)
                query = query.Where(b => b.Appointment >= f.DateFrom.Value);

            if (f.DateTo.HasValue)
                query = query.Where(b => b.Appointment <= f.DateTo.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((f.Page - 1) * f.PageSize)
                .Take(f.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<BookingSummaryAdminDto>(
                items.Select(BookingMapper.ToAdminSummaryDto).ToList(),
                totalCount,
                f.Page,
                f.PageSize);
        }
    }
}
