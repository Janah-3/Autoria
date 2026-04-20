using Autoria.features.ServiceCenter.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Querys.GetAllServiceCenters
{
    public class GetAllServiceCentersHandler : IRequestHandler<GetAllServiceCentersQuery, PagedResponse<ServiceCenterSummaryDto>>
    {
        private readonly AppDbContext _context;

        public GetAllServiceCentersHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResponse<ServiceCenterSummaryDto>> Handle(GetAllServiceCentersQuery request, CancellationToken cancellationToken)
        {
            var query = _context.ServiceCenters
                .Where(sc => sc.ApprovalStatus == ApprovalStatus.Approved)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search))
                query = query.Where(sc =>
                    sc.Name.Contains(request.Search) ||
                    sc.Description.Contains(request.Search));

            if (!string.IsNullOrWhiteSpace(request.Governorate))
                query = query.Where(sc => sc.Governorate == request.Governorate);

            if (!string.IsNullOrWhiteSpace(request.District))
                query = query.Where(sc => sc.District == request.District);

            if (request.Type.HasValue)
                query = query.Where(sc => sc.Type == request.Type.Value);

            if (request.ServiceTypeId.HasValue)
                query = query.Where(sc =>
                    sc.ServiceTypes.Any(st => st.ServiceTypeId == request.ServiceTypeId.Value));

            if (request.CarBrandId.HasValue)
                query = query.Where(sc =>
                    sc.CarBrands.Any(cb => cb.CarBrandId == request.CarBrandId.Value));

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(sc => new ServiceCenterSummaryDto
                {
                    Id = sc.Id,
                    Name = sc.Name,
                    Governorate = sc.Governorate,
                    District = sc.District,
                    Phone = sc.Phone,
                    Type = sc.Type,
                    Latitude = sc.Latitude,
                    Longitude = sc.Longitude,
                    CoverPhoto = sc.Photos.Select(p => p.PhotoUrl).FirstOrDefault(),
                    ServiceTypes = sc.ServiceTypes.Select(st => st.ServiceType.Name).ToList(),
                    CarBrands = sc.CarBrands.Select(cb => cb.CarBrand.Name).ToList()
                })
                .ToListAsync(cancellationToken);

            return new PagedResponse<ServiceCenterSummaryDto>(items, totalCount, request.Page, request.PageSize);
        }
    }
}
