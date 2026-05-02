using System.Security.Claims;
using Autoria.features.Inventory.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Inventory.Commands.UpdateInventoryStock
{
    public class UpdateInventoryStockHandler : IRequestHandler<UpdateInventoryStockCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateInventoryStockHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(UpdateInventoryStockCommand request, CancellationToken cancellationToken)
        {
            var adminId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var inventory = await _db.Inventories
                .FirstOrDefaultAsync(i => i.Id == request.InventoryId, cancellationToken)
                ?? throw new NotFoundException("Inventory record not found.");

            var previousQuantity = inventory.Quantity;
            var previousPrice = inventory.Price;

            inventory.Quantity = request.Quantity;
            inventory.Price = request.Price;
            inventory.IsAvailable = request.IsAvailable && request.Quantity > 0;
            inventory.LowStockThreshold = request.LowStockThreshold;
            inventory.IsFlaggedLowStock = request.Quantity <= request.LowStockThreshold;
            inventory.UpdatedAt = DateTime.UtcNow;

            _db.InventoryHistories.Add(new InventoryHistory
            {
                Id = Guid.NewGuid(),
                InventoryId = inventory.Id,
                ChangedById = adminId,
                PreviousQuantity = previousQuantity,
                NewQuantity = request.Quantity,
                PreviousPrice = previousPrice,
                NewPrice = request.Price,
                Reason = request.Reason ?? "Updated by admin.",
                ChangedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
