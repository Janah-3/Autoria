using Autoria.features.Notifications.Commands.MarkAllNotificationsAsRead;
using Autoria.features.Notifications.Commands.MarkNotificationAsRead;
using Autoria.features.Notifications.Dtos;
using Autoria.features.Notifications.Queries.GetUserNotifications;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Notifications
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NotificationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>Get current user's notifications — filter by read/unread</summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications(
            [FromQuery] bool? isRead,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetUserNotificationsQuery(isRead, page, pageSize));
            return Ok(ApiResponse<PagedResponse<NotificationDto>>.Ok(result));
        }

        /// <summary>Mark a single notification as read</summary>
        [HttpPatch("{id:guid}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            await _mediator.Send(new MarkNotificationAsReadCommand(id));
            return Ok(ApiResponse<object>.Ok(null!, "Notification marked as read."));
        }

        /// <summary>Mark all notifications as read</summary>
        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            await _mediator.Send(new MarkAllNotificationsAsReadCommand());
            return Ok(ApiResponse<object>.Ok(null!, "All notifications marked as read."));
        }
    }
}
