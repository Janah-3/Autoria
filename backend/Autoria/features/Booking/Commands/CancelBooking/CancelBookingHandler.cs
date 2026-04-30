using System.Security.Claims;
using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Commands.CancelBooking
{
    public class CancelBookingHandler : IRequestHandler<CancelBookingCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAdminLogService _adminLog;
        private readonly INotificationService _notificationService;

        public CancelBookingHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor, IAdminLogService adminLog, INotificationService notificationService)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _adminLog = adminLog;
            _notificationService = notificationService;
        }

        public async Task Handle(CancelBookingCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var query = _db.Bookings
                .Include(b => b.User)
                .Include(b => b.ServiceCenter)
                .Where(b => b.Id == request.BookingId);

            if (!request.BypassOwnerCheck)
                query = query.Where(b => b.UserId == userId);

            var booking = await query.FirstOrDefaultAsync(cancellationToken)
                ?? throw new NotFoundException("Booking not found.");

            if (!request.BypassOwnerCheck && booking.UserId != userId)
                throw new ForbiddenException("You do not have access to this booking.");

            if (booking.Status == BookingStatus.Completed)
                throw new BadRequestException("Cannot cancel a completed booking.");

            if (booking.Status == BookingStatus.Cancelled)
                throw new BadRequestException("Booking is already cancelled.");

            var reason = request.BypassOwnerCheck
                ? (request.CancellationReason ?? "Cancelled by admin.")
                : request.CancellationReason;

            booking.Status = BookingStatus.Cancelled;
            booking.CancellationReason = reason;

            // Release the time slot
            if (booking.TimeSlotId.HasValue)
            {
                var slot = await _db.TimeSlots.FindAsync([booking.TimeSlotId.Value], cancellationToken);
                if (slot is not null)
                    slot.IsBooked = false;
            }

            await _db.SaveChangesAsync(cancellationToken);

            await _notificationService.SendAsync(
                userId: booking.UserId,
                userEmail: booking.User.Email!,
                type: NotificationType.BookingCancelled,
                channel: NotificationChannel.Both,
                content: $"Your booking at {booking.ServiceCenter.Name} on {booking.Appointment:dd MMM yyyy HH:mm} has been cancelled. Reason: {reason}");

            if (request.BypassOwnerCheck)
                await _adminLog.LogAsync(
                    adminId: userId,
                    action: AdminActionType.DeleteBooking,
                    targetType: AdminTargetType.Booking,
                    targetId: booking.Id.ToString(),
                    details: reason);
        }
    }
}
