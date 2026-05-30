using Autoria.features.SpareParts.Dtos;
using Autoria.features.SpareParts.Mapper;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Queries.GetSparePartsCatalog
{
    public class GetSparePartsCatalogHandler : IRequestHandler<GetSparePartsCatalogQuery, PagedResponse<SparePartSummaryDto>>
    {
        private readonly AppDbContext _db;

        public GetSparePartsCatalogHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResponse<SparePartSummaryDto>> Handle(GetSparePartsCatalogQuery request, CancellationToken cancellationToken)
        {
            var f = request.Filter;

            var query = _db.SpareParts
                .Include(sp => sp.Images)
                .Include(sp => sp.Inventories)
                .Include(sp => sp.Compatibilities)
                .Where(sp => sp.IsActive);

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

            if (!string.IsNullOrWhiteSpace(f.Model))
                query = query.Where(sp => sp.Model == f.Model);

            if (!string.IsNullOrWhiteSpace(f.PartNumber))
                query = query.Where(sp => sp.PartNumber == f.PartNumber);

            if (f.IsAvailable.HasValue)
                query = query.Where(sp => sp.Inventories.Any(i => i.IsAvailable && i.Quantity > 0));

            // TC-BE-SP-04: car compatibility filter
            if (!string.IsNullOrWhiteSpace(f.CarMake))
                query = query.Where(sp => sp.Compatibilities.Any(c =>
                    c.CarMake.ToLower() == f.CarMake.ToLower()));

            if (!string.IsNullOrWhiteSpace(f.CarModel))
                query = query.Where(sp => sp.Compatibilities.Any(c =>
                    c.CarModel.ToLower() == f.CarModel.ToLower()));

            if (f.CarYear.HasValue)
                query = query.Where(sp => sp.Compatibilities.Any(c =>
                    (c.YearFrom == null || c.YearFrom <= f.CarYear) &&
                    (c.YearTo == null || c.YearTo >= f.CarYear)));

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
