using System.Security.Claims;
using Autoria.features.Inventory.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Inventory.Commands.UpsertInventory
{
    public class UpsertInventoryHandler : IRequestHandler<UpsertInventoryCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpsertInventoryHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(UpsertInventoryCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var ownsCenter = await _db.ServiceCenters
                .AnyAsync(sc => sc.Id == request.ServiceCenterId && sc.UserId == userId, cancellationToken);
            if (!ownsCenter)
                throw new ForbiddenException("You do not own this service center.");

            var partExists = await _db.SpareParts
                .AnyAsync(sp => sp.Id == request.SparePartId && sp.IsActive, cancellationToken);
            if (!partExists)
                throw new NotFoundException("Spare part not found.");

            var inventory = await _db.Inventories
                .FirstOrDefaultAsync(i =>
                    i.ServiceCenterId == request.ServiceCenterId &&
                    i.SparePartId == request.SparePartId, cancellationToken);

            var previousQuantity = inventory?.Quantity ?? 0;
            var previousPrice = inventory?.Price ?? 0;

            if (inventory is null)
            {
                inventory = new Entities.Inventory
                {
                    Id = Guid.NewGuid(),
                    ServiceCenterId = request.ServiceCenterId,
                    SparePartId = request.SparePartId,
                };
                _db.Inventories.Add(inventory);
            }

            inventory.Quantity = request.Quantity;
            inventory.Price = request.Price;
            inventory.IsAvailable = request.IsAvailable && request.Quantity > 0;
            inventory.IsFlaggedLowStock = request.Quantity <= inventory.LowStockThreshold;
            inventory.UpdatedAt = DateTime.UtcNow;

            // Log history
            _db.InventoryHistories.Add(new InventoryHistory
            {
                Id = Guid.NewGuid(),
                InventoryId = inventory.Id,
                ChangedById = userId,
                PreviousQuantity = previousQuantity,
                NewQuantity = request.Quantity,
                PreviousPrice = previousPrice,
                NewPrice = request.Price,
                Reason = request.Reason,
                ChangedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync(cancellationToken);

            return inventory.Id;
        }
    }
}
