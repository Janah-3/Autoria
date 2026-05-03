using Autoria.features.Notifications.Dtos;

namespace Autoria.features.Notifications.Mappers
{
    public static class NotificationMapper
    {
        public static NotificationDto ToDto(Entities.Notification n) => new()
        {
            Id = n.Id,
            Type = n.Type,
            Channel = n.Channel,
            Content = n.Content,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
            ReadAt = n.ReadAt,
        };
    }
}
