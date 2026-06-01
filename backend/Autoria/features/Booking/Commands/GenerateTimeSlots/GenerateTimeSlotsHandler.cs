using System.Security.Claims;
using Autoria.features.Booking.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Commands.GenerateTimeSlots
{
    public class GenerateTimeSlotsHandler : IRequestHandler<GenerateTimeSlotsCommand, int>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GenerateTimeSlotsHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<int> Handle(GenerateTimeSlotsCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var ownsCenter = await _db.ServiceCenters
                .AnyAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken);
            if (!ownsCenter)
                throw new ForbiddenException("You do not own this service center.");

            // Get operating hours for the requested day
            var dayOfWeek = request.Date.DayOfWeek;

            var operatingHours = await _db.OperatingHours
                .FirstOrDefaultAsync(oh =>
                    oh.ServiceCenterId == request.ServiceCenterId &&
                    oh.Day == dayOfWeek, cancellationToken);

            if (operatingHours is null)
                throw new BadRequestException($"No operating hours defined for {dayOfWeek}.");

            if (operatingHours.IsClosed)
                throw new BadRequestException($"The service center is closed on {dayOfWeek}.");

            // Get existing slots for that day to avoid duplicates
            var existingSlots = await _db.TimeSlots
                .Where(ts => ts.ServiceCenterId == request.ServiceCenterId && ts.Date == request.Date)
                .Select(ts => ts.StartTime)
                .ToListAsync(cancellationToken);

            var slotsToCreate = new List<TimeSlot>();
            var current = operatingHours.OpenTime;

            // Generate one slot per hour within working hours
            while (current.AddHours(1) <= operatingHours.CloseTime)
            {
                var slotStart = current;
                var slotEnd = current.AddHours(1);

                // Skip if slot already exists for this time
                if (!existingSlots.Contains(slotStart))
                {
                    slotsToCreate.Add(new TimeSlot
                    {
                        Id = Guid.NewGuid(),
                        ServiceCenterId = request.ServiceCenterId,
                        Date = request.Date,
                        StartTime = slotStart,
                        EndTime = slotEnd,
                        IsBlocked = false,
                        IsBooked = false,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                current = slotEnd;
            }

            if (!slotsToCreate.Any())
                return 0;

            _db.TimeSlots.AddRange(slotsToCreate);
            await _db.SaveChangesAsync(cancellationToken);

            return slotsToCreate.Count;
        }
    }
}
