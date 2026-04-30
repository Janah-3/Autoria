using Autoria.features.Notifications.Enums;

namespace Autoria.features.Notifications.Services
{
    public interface INotificationService
    {
        Task SendAsync(
        string userId,
        string userEmail,
        NotificationType type,
        NotificationChannel channel,
        string content);
    }
}
