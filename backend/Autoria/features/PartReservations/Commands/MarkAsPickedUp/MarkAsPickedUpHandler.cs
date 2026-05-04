using Autoria.features.PartReservations.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.PartReservations.Commands.MarkAsPickedUp
{
    public class MarkAsPickedUpHandler : IRequestHandler<MarkAsPickedUpCommand, Unit>
    {
        private readonly AppDbContext _db;
        private readonly ICurrentUserService _currentUser;
        private readonly IAdminLogService _adminLog;

        public MarkAsPickedUpHandler(AppDbContext db, ICurrentUserService currentUser, IAdminLogService adminLog)
        {
            _db = db;
            _currentUser = currentUser;
            _adminLog = adminLog;
        }

        public async Task<Unit> Handle(MarkAsPickedUpCommand request, CancellationToken cancellationToken)
        {
            var ServiceCenterOwner = _currentUser.GetUserId();

            var reservation = await _db.PartReservations
                .FirstOrDefaultAsync(r => r.Id == request.ReservationId, cancellationToken)
                ?? throw new NotFoundException("Reservation not found.");

            var serviceCenter = await _db.ServiceCenters
            .FirstOrDefaultAsync(sc => sc.UserId == ServiceCenterOwner, cancellationToken)
            ?? throw new NotFoundException("Service center not found for this user.");

            if (reservation.ServiceCenterId != serviceCenter.Id)
                throw new ForbiddenException("You are not allowed to update this reservation.");


            if (reservation.Status != ReservationStatus.Pending)
                throw new BadRequestException("Only pending reservations can be marked as picked up.");

            reservation.Status = ReservationStatus.PickedUp;
            reservation.PickedUpAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);

        

            return Unit.Value;
        }
    }
}