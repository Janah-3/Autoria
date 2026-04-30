using Autoria.features.Notifications.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Notifications.Queries.GetUserNotifications
{
    public record GetUserNotificationsQuery(
        bool? IsRead = null,
        int Page = 1,
        int PageSize = 10
    ) : IRequest<PagedResponse<NotificationDto>>;
}
