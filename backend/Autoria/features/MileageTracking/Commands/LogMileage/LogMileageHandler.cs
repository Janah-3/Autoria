using System.Security.Claims;
using Autoria.features.MileageTracking.Entities;
using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.MileageTracking.Commands.LogMileage
{
    public class LogMileageHandler : IRequestHandler<LogMileageCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;

        public LogMileageHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor, INotificationService notificationService)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        public async Task<Guid> Handle(LogMileageCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var car = await _db.Cars
                .FirstOrDefaultAsync(c => c.CarId == request.CarId && c.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Car not found or does not belong to the current user.");

            // Validate mileage is not lower than last entry
            var lastEntry = await _db.MileageEntries
                .Where(e => e.CarId == request.CarId)
                .OrderByDescending(e => e.LoggedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (lastEntry is not null && request.Mileage < lastEntry.Mileage)
                throw new BadRequestException($"Mileage cannot be lower than the last logged value ({lastEntry.Mileage} km).");

            var entry = new MileageEntry
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CarId = request.CarId,
                Mileage = request.Mileage,
                Notes = request.Notes,
                LoggedAt = DateTime.UtcNow
            };

            _db.MileageEntries.Add(entry);

            // Check all active reminders for this car
            var triggeredReminders = await _db.MaintenanceReminders
                .Where(r =>
                    r.CarId == request.CarId &&
                    r.IsActive &&
                    !r.IsTriggered &&
                    r.MileageThreshold <= request.Mileage)
                .ToListAsync(cancellationToken);

            foreach (var reminder in triggeredReminders)
            {
                reminder.IsTriggered = true;
                reminder.TriggeredAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(cancellationToken);

            // Send notification for each triggered reminder
            if (triggeredReminders.Any())
            {
                var user = await _db.Users.FindAsync([userId], cancellationToken);
                foreach (var reminder in triggeredReminders)
                {
                    await _notificationService.SendAsync(
                        userId: userId,
                        userEmail: user!.Email!,
                        type: NotificationType.MaintenanceReminder,
                        channel: NotificationChannel.Both,
                        content: $"Maintenance reminder: '{reminder.Title}' for your {car.Make} {car.Model} has been reached at {request.Mileage} km.");
                }
            }

            return entry.Id;
        }
    }
}
