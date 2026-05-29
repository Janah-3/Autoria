using Autoria.features.Notifications.Entities;
using Autoria.features.Notifications.Enums;
using Autoria.Infrastructure.Email.Contracts;
using Autoria.Infrastructure.Persistence;

namespace Autoria.features.Notifications.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _db;
        private readonly IEmailService _emailService;

        public NotificationService(AppDbContext db, IEmailService emailService)
        {
            _db = db;
            _emailService = emailService;
        }

        public async Task SendAsync(
            string userId,
            string userEmail,
            NotificationType type,
            NotificationChannel channel,
            string content)
        {
            // Always persist in-app notification
            if (channel == NotificationChannel.InApp || channel == NotificationChannel.Both)
            {
                var notification = new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = type,
                    Channel = channel,
                    Content = content,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Notifications.Add(notification);
                await _db.SaveChangesAsync();
            }

            // Send email if channel requires it
            if (channel == NotificationChannel.Email || channel == NotificationChannel.Both)
            {
                var subject = GetEmailSubject(type);
                await _emailService.SendMailAsync(userEmail, subject, content);
            }
        }

        private static string GetEmailSubject(NotificationType type) => type switch
        {
            NotificationType.BookingConfirmed => "Your booking has been confirmed",
            NotificationType.BookingCancelled => "Your booking has been cancelled",
            NotificationType.BookingCompleted => "Your booking has been completed",
            NotificationType.BookingRescheduled => "Your booking has been rescheduled",
            NotificationType.BookingPending => "Your booking is pending confirmation",
            NotificationType.MaintenanceReminder => "Maintenance reminder for your vehicle",
            _ => "Autoria Notification"
        };

    }
}
