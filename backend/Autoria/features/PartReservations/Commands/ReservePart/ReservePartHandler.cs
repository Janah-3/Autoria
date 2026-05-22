using Autoria.features.PartReservations.Entities;
using Autoria.features.PartReservations.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.PartReservations.Commands.ReservePart
{
    public class ReservePartHandler : IRequestHandler<ReservePartCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly ICurrentUserService _currentUser;

        public ReservePartHandler(AppDbContext db, ICurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        public async Task<Guid> Handle(ReservePartCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUser.GetUserId();
                

            var inventory = await _db.Inventories
                .FirstOrDefaultAsync(i =>
                    i.ServiceCenterId == request.ServiceCenterId &&
                    i.SparePartId == request.SparePartId &&
                    i.IsAvailable, cancellationToken)
                ?? throw new NotFoundException("Part not available at this service center.");

            if (inventory.Quantity < request.Quantity)
                throw new BadRequestException($"Only {inventory.Quantity} units available.");

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