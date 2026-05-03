using System.Security.Claims;
using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Commands.CompleteBooking
{
    public class CompleteBookingHandler : IRequestHandler<CompleteBookingCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;

        public CompleteBookingHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor, INotificationService notificationService)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        public async Task Handle(CompleteBookingCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var booking = await _db.Bookings
                .Include(b => b.ServiceCenter)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken)
                ?? throw new NotFoundException("Booking not found.");

            if (booking.ServiceCenter.UserId != userId)
                throw new ForbiddenException("Only the service center owner can complete bookings.");

            if (booking.Status != BookingStatus.Confirmed)
                throw new BadRequestException("Only confirmed bookings can be marked as completed.");

            booking.Status = BookingStatus.Completed;
            booking.TotalPrice = request.TotalPrice;
            booking.CompletedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);

            await _notificationService.SendAsync(
                userId: booking.UserId,
                userEmail: booking.User.Email!,
                type: NotificationType.BookingCompleted,
                channel: NotificationChannel.Both,
                content: $"Your booking at {booking.ServiceCenter.Name} has been completed. Total: {request.TotalPrice:C}.");
        }
    }
}
