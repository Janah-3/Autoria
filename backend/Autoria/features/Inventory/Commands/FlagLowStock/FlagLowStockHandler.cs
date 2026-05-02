using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Inventory.Commands.FlagLowStock
{
    public class FlagLowStockHandler : IRequestHandler<FlagLowStockCommand>
    {
        private readonly AppDbContext _db;

        public FlagLowStockHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task Handle(FlagLowStockCommand request, CancellationToken cancellationToken)
        {
            var inventory = await _db.Inventories
                .FirstOrDefaultAsync(i => i.Id == request.InventoryId, cancellationToken)
                ?? throw new NotFoundException("Inventory record not found.");

            inventory.IsFlaggedLowStock = request.IsFlagged;
            inventory.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
