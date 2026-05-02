using System.Security.Claims;
using Autoria.features.SpareParts.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Commands.CancelReservation
{
    public class CancelReservationHandler : IRequestHandler<CancelReservationCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CancelReservationHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(CancelReservationCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var reservation = await _db.PartReservations
                .FirstOrDefaultAsync(r => r.Id == request.ReservationId && r.ClientId == userId, cancellationToken)
                ?? throw new NotFoundException("Reservation not found.");

            if (reservation.Status == ReservationStatus.Cancelled)
                throw new BadRequestException("Reservation is already cancelled.");

            if (reservation.Status == ReservationStatus.Fulfilled)
                throw new BadRequestException("Cannot cancel a fulfilled reservation.");

            reservation.Status = ReservationStatus.Cancelled;
            reservation.CancellationReason = request.CancellationReason;

            // Restore inventory quantity
            var inventory = await _db.Inventories
                .FirstOrDefaultAsync(i =>
                    i.ServiceCenterId == reservation.ServiceCenterId &&
                    i.SparePartId == reservation.SparePartId, cancellationToken);

            if (inventory is not null)
            {
                inventory.Quantity += reservation.Quantity;
                inventory.IsAvailable = true;
                inventory.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
