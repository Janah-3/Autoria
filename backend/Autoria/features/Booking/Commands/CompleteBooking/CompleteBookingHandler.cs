using System.Security.Claims;
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

        public CompleteBookingHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(CompleteBookingCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var booking = await _db.Bookings
                .Include(b => b.ServiceCenter)
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
        }
    }

}
