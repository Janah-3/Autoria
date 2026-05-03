using System.Security.Claims;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Notifications.Commands.MarkNotificationAsRead
{
    public class MarkNotificationAsReadHandler : IRequestHandler<MarkNotificationAsReadCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public MarkNotificationAsReadHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var notification = await _db.Notifications
                .FirstOrDefaultAsync(n => n.Id == request.NotificationId && n.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Notification not found.");

            if (notification.IsRead)
                return;

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
