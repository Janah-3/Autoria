using Autoria.features.Inventory.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.Inventory.Queries.GetInventoryHistory
{
    public record GetInventoryHistoryQuery(
        Guid InventoryId,
        int Page = 1,
        int PageSize = 10
    ) : IRequest<PagedResponse<InventoryHistoryDto>>;
}
