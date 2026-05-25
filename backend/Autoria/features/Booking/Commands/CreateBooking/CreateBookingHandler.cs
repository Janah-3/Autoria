using System.Security.Claims;
using Autoria.features.Notifications.Enums;
using Autoria.features.Notifications.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Commands.CreateBooking
{
    public class CreateBookingHandler : IRequestHandler<CreateBookingCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;

        public CreateBookingHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor, INotificationService notificationService)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var car = await _db.Cars
                .FirstOrDefaultAsync(c => c.CarId == request.CarId && c.UserId == userId, cancellationToken)
                ?? throw new NotFoundException("Car not found or does not belong to the current user.");

            var serviceTypeExists = await _db.ServiceTypes
                .AnyAsync(st => st.Id == request.ServiceTypeId, cancellationToken);
            if (!serviceTypeExists)
                throw new NotFoundException("Service type not found.");

       

            var timeSlot = await _db.TimeSlots
      .FirstOrDefaultAsync(
          ts =>
              ts.Id == request.TimeSlotId &&
              ts.ServiceCenterId == request.ServiceCenterId &&
              !ts.IsBlocked &&
              !ts.IsBooked,
          cancellationToken
      )
      ?? throw new BadRequestException("Time slot is unavailable or does not exist.");

            var booking = new Entities.Booking
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CarId = request.CarId,
                ServiceCenterId = request.ServiceCenterId,
                ServiceTypeId = request.ServiceTypeId,
                TimeSlotId = timeSlot.Id,
                Appointment = timeSlot.Date.ToDateTime(timeSlot.StartTime),
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow
            };

            timeSlot.IsBooked = true;

            _db.Bookings.Add(booking);
            try
            {
                await _db.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.InnerException?.Message ?? ex.Message);
            }

            var user = await _db.Users.FindAsync([userId], cancellationToken);
            await _notificationService.SendAsync(
                userId: userId,
                userEmail: user!.Email!,
                type: NotificationType.BookingPending,
                channel: NotificationChannel.Both,
                content: $"Your booking on {booking.Appointment:dd MMM yyyy HH:mm} has been submitted and is awaiting confirmation.");

            return booking.Id;
        }
    }
}
