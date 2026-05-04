using Autoria.features.PartReservations.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.PartReservations.Commands.CancelReservation
{
    public class CancelReservationHandler : IRequestHandler<CancelReservationCommand, Unit>
    {
        private readonly AppDbContext _db;
        private readonly ICurrentUserService _currentUser;

        public CancelReservationHandler(AppDbContext db, ICurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
 
        }

        public async Task<Unit> Handle(CancelReservationCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUser.GetUserId();

            var reservation = await _db.PartReservations
                .FirstOrDefaultAsync(r => r.Id == request.ReservationId, cancellationToken)
                ?? throw new NotFoundException("Reservation not found.");

            if (reservation.ClientId != userId)
                throw new ForbiddenException("You are not allowed to cancel this reservation.");

            if (reservation.Status != ReservationStatus.Pending)
                throw new BadRequestException("Only pending reservations can be cancelled.");

            reservation.Status = ReservationStatus.Cancelled;
            reservation.CancellationReason = request.Reason;
            reservation.CancelledAt = DateTime.UtcNow;

            // Restore inventory
            var inventory = await _db.Inventories
                .FirstOrDefaultAsync(i =>
                    i.ServiceCenterId == reservation.ServiceCenterId &&
                    i.SparePartId == reservation.SparePartId, cancellationToken);

            if (inventory is not null)
            {
                inventory.Quantity += reservation.Quantity;
                inventory.IsAvailable = true;
            }

            await _db.SaveChangesAsync(cancellationToken);

           

            return Unit.Value;
        }
    }
}