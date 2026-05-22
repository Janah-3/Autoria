using System.Security.Claims;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.MileageTracking.Commands.DeleteMaintenanceReminder
{
    public class DeleteMaintenanceReminderHandler : IRequestHandler<DeleteMaintenanceReminderCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteMaintenanceReminderHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(DeleteMaintenanceReminderCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var reminder = await _db.MaintenanceReminders
                .FirstOrDefaultAsync(r => r.Id == request.ReminderId && r.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Reminder not found.");

            reminder.IsActive = false;

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
