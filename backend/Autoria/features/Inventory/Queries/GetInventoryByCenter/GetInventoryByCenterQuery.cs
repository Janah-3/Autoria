using Autoria.features.Inventory.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Inventory.Queries.GetInventoryByCenter
{
    public record GetInventoryByCenterQuery(
        Guid ServiceCenterId,
        bool? IsAvailable = null,
        int Page = 1,
        int PageSize = 10
    ) : IRequest<PagedResponse<InventorySummaryDto>>;
}
