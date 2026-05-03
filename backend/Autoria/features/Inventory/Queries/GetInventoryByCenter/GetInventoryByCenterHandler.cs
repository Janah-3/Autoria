using Autoria.features.Inventory.Dtos;
using Autoria.features.Inventory.Mapper;
using Autoria.features.SpareParts.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Inventory.Queries.GetInventoryByCenter
{
    public class GetInventoryByCenterHandler : IRequestHandler<GetInventoryByCenterQuery, PagedResponse<InventorySummaryDto>>
    {
        private readonly AppDbContext _db;

        public GetInventoryByCenterHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResponse<InventorySummaryDto>> Handle(GetInventoryByCenterQuery request, CancellationToken cancellationToken)
        {
            var query = _db.Inventories
                .Include(i => i.SparePart)
                    .ThenInclude(sp => sp.Images)
                .Where(i => i.ServiceCenterId == request.ServiceCenterId);

            if (request.IsAvailable.HasValue)
                query = query.Where(i => i.IsAvailable == request.IsAvailable.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderBy(i => i.SparePart.Name)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<InventorySummaryDto>(
                items.Select(InventoryMapper.ToInventorySummaryDto).ToList(),
                totalCount,
                request.Page,
                request.PageSize);
        }
    }
}
