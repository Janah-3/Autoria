using Autoria.features.SpareParts.Dtos;
using Autoria.features.SpareParts.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Queries.GetAllSpareParts
{
    public class GetAllSparePartsHandler : IRequestHandler<GetAllSparePartsQuery, PagedResponse<SparePartSummaryDto>>
    {
        private readonly AppDbContext _db;

        public GetAllSparePartsHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResponse<SparePartSummaryDto>> Handle(GetAllSparePartsQuery request, CancellationToken cancellationToken)
        {
            var f = request.Filter;

            var query = _db.SpareParts
                .Include(sp => sp.Images)
                .Include(sp => sp.Inventories)
                .AsQueryable();

            if (!request.IncludeInactive)
                query = query.Where(sp => sp.IsActive);

            if (!string.IsNullOrWhiteSpace(f.Search))
                query = query.Where(sp =>
                    sp.Name.Contains(f.Search) ||
                    sp.PartNumber.Contains(f.Search) ||
                    sp.Brand.Contains(f.Search) ||
                    sp.Model.Contains(f.Search));

            if (!string.IsNullOrWhiteSpace(f.Category))
                query = query.Where(sp => sp.Category == f.Category);

            if (!string.IsNullOrWhiteSpace(f.Brand))
                query = query.Where(sp => sp.Brand == f.Brand);

            if (!string.IsNullOrWhiteSpace(f.PartNumber))
                query = query.Where(sp => sp.PartNumber == f.PartNumber);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderBy(sp => sp.Name)
                .Skip((f.Page - 1) * f.PageSize)
                .Take(f.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<SparePartSummaryDto>(
                items.Select(SparePartMapper.ToSummaryDto).ToList(),
                totalCount,
                f.Page,
                f.PageSize);
        }
    }
}
