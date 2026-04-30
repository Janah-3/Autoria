using System.Security.Claims;
using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Commands.RescheduleBooking
{
    public class RescheduleBookingHandler : IRequestHandler<RescheduleBookingCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;

        public RescheduleBookingHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor, INotificationService notificationService)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        public async Task Handle(RescheduleBookingCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var booking = await _db.Bookings
                .Include(b => b.User)
                .Include(b => b.ServiceCenter)
                .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken)
                ?? throw new NotFoundException("Booking not found.");

            if (booking.UserId != userId)
                throw new ForbiddenException("You do not have access to this booking.");

            if (booking.Status != BookingStatus.Pending && booking.Status != BookingStatus.Confirmed)
                throw new BadRequestException("Only pending or confirmed bookings can be rescheduled.");

            var newSlot = await _db.TimeSlots
                .FirstOrDefaultAsync(ts =>
                    ts.Id == request.NewTimeSlotId &&
                    ts.ServiceCenterId == booking.ServiceCenterId &&
                    !ts.IsBlocked &&
                    !ts.IsBooked, cancellationToken)
                ?? throw new BadRequestException("The selected time slot is unavailable.");

            // Release old slot
            if (booking.TimeSlotId.HasValue)
            {
                var oldSlot = await _db.TimeSlots.FindAsync([booking.TimeSlotId.Value], cancellationToken);
                if (oldSlot is not null)
                    oldSlot.IsBooked = false;
            }

            // Lock new slot
            newSlot.IsBooked = true;
            booking.TimeSlotId = newSlot.Id;
            booking.Appointment = newSlot.Date.ToDateTime(newSlot.StartTime);
            booking.Status = BookingStatus.Pending;

            await _db.SaveChangesAsync(cancellationToken);

            await _notificationService.SendAsync(
                userId: booking.UserId,
                userEmail: booking.User.Email!,
                type: NotificationType.BookingRescheduled,
                channel: NotificationChannel.Both,
                content: $"Your booking at {booking.ServiceCenter.Name} has been rescheduled to {booking.Appointment:dd MMM yyyy HH:mm}.");
        }
    }
}
