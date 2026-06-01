using System.Security.Claims;
using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Commands.RejectBooking
{
    public class RejectBookingHandler : IRequestHandler<RejectBookingCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;

        public RejectBookingHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor, INotificationService notificationService)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        public async Task Handle(RejectBookingCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var booking = await _db.Bookings
                .Include(b => b.User)
                .Include(b => b.ServiceCenter)
                .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken)
                ?? throw new NotFoundException("Booking not found.");

            if (booking.ServiceCenter.UserId != userId)
                throw new ForbiddenException("Only the service center owner can reject bookings.");

            if (booking.Status != BookingStatus.Pending)
                throw new BadRequestException("Only pending bookings can be rejected.");

            booking.Status = BookingStatus.Rejected;
            booking.CancellationReason = request.Reason;

            // Release the time slot so others can book it
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
                type: NotificationType.BookingRejected,
                channel: NotificationChannel.Both,
                content: $"Your booking at {booking.ServiceCenter.Name} on {booking.Appointment:dd MMM yyyy HH:mm} has been rejected. Reason: {request.Reason}");
        }
    }
}
