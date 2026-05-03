using Autoria.features.Booking.Dtos;
using Autoria.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Queries.GetAvailableSlots
{
    public class GetAvailableSlotsHandler : IRequestHandler<GetAvailableSlotsQuery, List<TimeSlotDto>>
    {
        private readonly AppDbContext _db;

        public GetAvailableSlotsHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<TimeSlotDto>> Handle(GetAvailableSlotsQuery request, CancellationToken cancellationToken)
        {
            var slots = await _db.TimeSlots
                .Where(ts =>
                    ts.ServiceCenterId == request.ServiceCenterId &&
                    ts.Date == request.Date &&
                    !ts.IsBlocked &&
                    !ts.IsBooked)
                .OrderBy(ts => ts.StartTime)
                .Select(ts => new TimeSlotDto
                {
                    Id = ts.Id,
                    Date = ts.Date,
                    StartTime = ts.StartTime,
                    EndTime = ts.EndTime,
                    IsAvailable = true
                })
                .ToListAsync(cancellationToken);

            return slots;
        }
    }
}
