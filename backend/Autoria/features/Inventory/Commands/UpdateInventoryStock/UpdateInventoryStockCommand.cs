using MediatR;

namespace Autoria.features.Inventory.Commands.UpdateInventoryStock
{
    public record UpdateInventoryStockCommand(
        Guid InventoryId,
        int Quantity,
        decimal Price,
        bool IsAvailable,
        int LowStockThreshold,
        string? Reason = null
    ) : IRequest;
}
