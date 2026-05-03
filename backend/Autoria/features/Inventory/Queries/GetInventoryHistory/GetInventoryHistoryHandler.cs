using Autoria.features.Inventory.Dtos;
using Autoria.features.Inventory.Mapper;
using Autoria.features.SpareParts.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Inventory.Queries.GetInventoryHistory
{
    public class GetInventoryHistoryHandler : IRequestHandler<GetInventoryHistoryQuery, PagedResponse<InventoryHistoryDto>>
    {
        private readonly AppDbContext _db;

        public GetInventoryHistoryHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResponse<InventoryHistoryDto>> Handle(GetInventoryHistoryQuery request, CancellationToken cancellationToken)
        {
            var inventoryExists = await _db.Inventories
                .AnyAsync(i => i.Id == request.InventoryId, cancellationToken);
            if (!inventoryExists)
                throw new NotFoundException("Inventory record not found.");

            var query = _db.InventoryHistories
                .Include(h => h.ChangedBy)
                .Where(h => h.InventoryId == request.InventoryId);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(h => h.ChangedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<InventoryHistoryDto>(
                items.Select(InventoryMapper.ToInventoryHistoryDto).ToList(),
                totalCount,
                request.Page,
                request.PageSize);
        }
    }
}
