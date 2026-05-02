using Autoria.features.Inventory.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Inventory.Queries.GetAllInventory
{
    public record GetAllInventoryQuery(
        Guid? ServiceCenterId = null,
        Guid? SparePartId = null,
        bool? IsFlaggedLowStock = null,
        bool? IsAvailable = null,
        int Page = 1,
        int PageSize = 10
    ) : IRequest<PagedResponse<InventoryAdminDto>>;
}
