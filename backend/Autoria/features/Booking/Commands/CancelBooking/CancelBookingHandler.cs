using System.Security.Claims;
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

        public CancelBookingHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor, IAdminLogService adminLog)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _adminLog = adminLog;
        }

        public async Task Handle(CancelBookingCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var query = _db.Bookings.Where(b => b.Id == request.BookingId);

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

            booking.Status = BookingStatus.Cancelled;
            booking.CancellationReason = request.BypassOwnerCheck
                ? (request.CancellationReason ?? "Cancelled by admin.")
                : request.CancellationReason;

            // Release the time slot
            if (booking.TimeSlotId.HasValue)
            {
                var slot = await _db.TimeSlots.FindAsync([booking.TimeSlotId.Value], cancellationToken);
                if (slot is not null)
                    slot.IsBooked = false;
            }

            await _db.SaveChangesAsync(cancellationToken);

            if (request.BypassOwnerCheck)
                await _adminLog.LogAsync(
                    adminId: userId,
                    action: AdminActionType.DeleteBooking,
                    targetType: AdminTargetType.Booking,
                    targetId: booking.Id.ToString(),
                    details: request.CancellationReason ?? "Cancelled by admin.");
        }
    }
}
