using Autoria.features.Inventory.Dtos;
using Autoria.features.Inventory.Mapper;
using Autoria.features.SpareParts.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Inventory.Queries.GetAllInventory
{
    public class GetAllInventoryHandler : IRequestHandler<GetAllInventoryQuery, PagedResponse<InventoryAdminDto>>
    {
        private readonly AppDbContext _db;

        public GetAllInventoryHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResponse<InventoryAdminDto>> Handle(GetAllInventoryQuery request, CancellationToken cancellationToken)
        {
            var query = _db.Inventories
                .Include(i => i.SparePart)
                .Include(i => i.ServiceCenter)
                .AsQueryable();

            if (request.ServiceCenterId.HasValue)
                query = query.Where(i => i.ServiceCenterId == request.ServiceCenterId.Value);

            if (request.SparePartId.HasValue)
                query = query.Where(i => i.SparePartId == request.SparePartId.Value);

            if (request.IsFlaggedLowStock.HasValue)
                query = query.Where(i => i.IsFlaggedLowStock == request.IsFlaggedLowStock.Value);

            if (request.IsAvailable.HasValue)
                query = query.Where(i => i.IsAvailable == request.IsAvailable.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(i => i.IsFlaggedLowStock)
                .ThenBy(i => i.SparePart.Name)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<InventoryAdminDto>(
                items.Select(InventoryMapper.ToInventoryAdminDto).ToList(),
                totalCount,
                request.Page,
                request.PageSize);
        }
    }
}
