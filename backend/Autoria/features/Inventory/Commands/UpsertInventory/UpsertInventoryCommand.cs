using MediatR;

namespace Autoria.features.Inventory.Commands.UpsertInventory
{
    public record UpsertInventoryCommand(
        Guid ServiceCenterId,
        Guid SparePartId,
        int Quantity,
        decimal Price,
        bool IsAvailable,
        string? Reason = null
    ) : IRequest<Guid>;
}
