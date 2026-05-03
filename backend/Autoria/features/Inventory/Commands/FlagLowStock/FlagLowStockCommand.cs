using MediatR;

namespace Autoria.features.Inventory.Commands.FlagLowStock
{
    public record FlagLowStockCommand(
        Guid InventoryId,
        bool IsFlagged
    ) : IRequest;
}
