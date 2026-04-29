using System.Security.Claims;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Booking.Commands.ConfirmBooking
{
    public class ConfirmBookingHandler : IRequestHandler<ConfirmBookingCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ConfirmBookingHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(ConfirmBookingCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var booking = await _db.Bookings
                .Include(b => b.ServiceCenter)
                .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken)
                ?? throw new NotFoundException("Booking not found.");

            if (booking.ServiceCenter.UserId != userId)
                throw new ForbiddenException("Only the service center owner can confirm bookings.");

            if (booking.Status != BookingStatus.Pending)
                throw new BadRequestException("Only pending bookings can be confirmed.");

            booking.Status = BookingStatus.Confirmed;

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
