using MediatR;

namespace Autoria.features.Notifications.Commands.MarkNotificationAsRead
{
    public record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest;
}
