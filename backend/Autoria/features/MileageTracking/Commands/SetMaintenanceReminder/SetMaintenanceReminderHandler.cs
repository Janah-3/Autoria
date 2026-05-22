using System.Security.Claims;
using Autoria.features.MileageTracking.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.MileageTracking.Commands.SetMaintenanceReminder
{
    public class SetMaintenanceReminderHandler : IRequestHandler<SetMaintenanceReminderCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SetMaintenanceReminderHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(SetMaintenanceReminderCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var carExists = await _db.Cars
                .AnyAsync(c => c.CarId == request.CarId && c.UserId == userId, cancellationToken);
            if (!carExists)
                throw new NotFoundException("Car not found or does not belong to the current user.");

            // Check latest mileage — warn if threshold already passed
            var latestMileage = await _db.MileageEntries
                .Where(e => e.CarId == request.CarId)
                .OrderByDescending(e => e.LoggedAt)
                .Select(e => (int?)e.Mileage)
                .FirstOrDefaultAsync(cancellationToken);

            var isAlreadyTriggered = latestMileage.HasValue && latestMileage.Value >= request.MileageThreshold;

            var reminder = new MaintenanceReminder
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CarId = request.CarId,
                Title = request.Title,
                MileageThreshold = request.MileageThreshold,
                IsTriggered = isAlreadyTriggered,
                TriggeredAt = isAlreadyTriggered ? DateTime.UtcNow : null,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.MaintenanceReminders.Add(reminder);
            await _db.SaveChangesAsync(cancellationToken);

            return reminder.Id;
        }
    }
}
