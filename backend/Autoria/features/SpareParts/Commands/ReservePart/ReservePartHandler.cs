using System.Security.Claims;
using Autoria.features.SpareParts.Entities;
using Autoria.features.SpareParts.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Commands.ReservePart
{
    public class ReservePartHandler : IRequestHandler<ReservePartCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ReservePartHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(ReservePartCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var inventory = await _db.Inventories
                .FirstOrDefaultAsync(i =>
                    i.ServiceCenterId == request.ServiceCenterId &&
                    i.SparePartId == request.SparePartId &&
                    i.IsAvailable, cancellationToken)
                ?? throw new NotFoundException("Part not available at this service center.");

            if (inventory.Quantity < request.Quantity)
                throw new BadRequestException($"Only {inventory.Quantity} units available.");

            // Validate booking belongs to user and same center if provided
            if (request.BookingId.HasValue)
            {
                var bookingValid = await _db.Bookings.AnyAsync(b =>
                    b.Id == request.BookingId.Value &&
                    b.UserId == userId &&
                    b.ServiceCenterId == request.ServiceCenterId, cancellationToken);
                if (!bookingValid)
                    throw new BadRequestException("Booking not found or does not match the selected service center.");
            }

            inventory.Quantity -= request.Quantity;
            if (inventory.Quantity == 0)
                inventory.IsAvailable = false;

            var reservation = new PartReservation
            {
                Id = Guid.NewGuid(),
                ClientId = userId,
                ServiceCenterId = request.ServiceCenterId,
                SparePartId = request.SparePartId,
                BookingId = request.BookingId,
                Quantity = request.Quantity,
                UnitPrice = inventory.Price,
                Status = ReservationStatus.Pending,
                ReservedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            _db.PartReservations.Add(reservation);
            await _db.SaveChangesAsync(cancellationToken);

            return reservation.Id;
        }
    }
}
