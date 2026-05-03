using System.Security.Claims;
using Autoria.features.Booking.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Commands.BlockTimeSlot
{
    public class BlockTimeSlotHandler : IRequestHandler<BlockTimeSlotCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BlockTimeSlotHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(BlockTimeSlotCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var ownsCenter = await _db.ServiceCenters
                .AnyAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken);
            if (!ownsCenter)
                throw new ForbiddenException("You do not own this service center.");

            var overlap = await _db.TimeSlots.AnyAsync(ts =>
                ts.ServiceCenterId == request.ServiceCenterId &&
                ts.Date == request.Date &&
                ts.StartTime < request.EndTime &&
                ts.EndTime > request.StartTime, cancellationToken);

            if (overlap)
                throw new ConflictException("A time slot already exists in this time range.");

            var slot = new TimeSlot
            {
                Id = Guid.NewGuid(),
                ServiceCenterId = request.ServiceCenterId,
                Date = request.Date,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                IsBlocked = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.TimeSlots.Add(slot);
            await _db.SaveChangesAsync(cancellationToken);

            return slot.Id;
        }
    }
}
