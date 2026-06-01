using Autoria.features.ServiceCenter.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace Autoria.features.ServiceCenter.Querys.GetAllServiceCenters
{
    public class GetAllServiceCentersHandler : IRequestHandler<GetAllServiceCentersQuery, PagedResponse<ServiceCenterSummaryDto>>
    {
        private readonly AppDbContext _context;
        private readonly GeometryFactory _geometryFactory;

        public GetAllServiceCentersHandler(AppDbContext context)
        {
            _context = context;
            _geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
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

            if (request.Type.HasValue)
                query = query.Where(sc => sc.Type == request.Type.Value);

            if (request.ServiceTypeId.HasValue)
                query = query.Where(sc =>
                    sc.ServiceTypes.Any(st => st.ServiceTypeId == request.ServiceTypeId.Value));

            if (request.CarBrandId.HasValue)
                query = query.Where(sc =>
                    sc.CarBrands.Any(cb => cb.CarBrandId == request.CarBrandId.Value));

            // Filter by governorate
            if (!string.IsNullOrWhiteSpace(request.Governorate))
                query = query.Where(sc => sc.Gvernorate == request.Governorate);

            // Filter by minimum rating
            if (request.MinRating.HasValue)
                query = query.Where(sc =>
                    sc.Reviews.Any() &&
                    sc.Reviews.Average(r => r.Rating) >= request.MinRating.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            bool hasLocation = request.Latitude.HasValue && request.Longitude.HasValue;

            IQueryable<ServiceCenterSummaryDto> projectedQuery;

            if (hasLocation)
            {
                var userPoint = _geometryFactory.CreatePoint(
                    new Coordinate(request.Longitude!.Value, request.Latitude!.Value));

                projectedQuery = query
                    .OrderBy(sc => sc.Location == null)
                    .ThenBy(sc => sc.Location!.Distance(userPoint))
                    .Select(sc => new ServiceCenterSummaryDto
                    {
                        Id = sc.Id,
                        Name = sc.Name,
                        Address = sc.Address,
                        Governorate = sc.Gvernorate,
                        Phone = sc.Phone,
                        Type = sc.Type,
                        CoverPhoto = sc.Photos.Select(p => p.PhotoUrl).FirstOrDefault(),
                        ServiceTypes = sc.ServiceTypes.Select(st => st.ServiceType.Name).ToList(),
                        CarBrands = sc.CarBrands.Select(cb => cb.CarBrand.Name).ToList(),
                        AverageRating = sc.Reviews.Any() ? sc.Reviews.Average(r => r.Rating) : 0,
                        ReviewCount = sc.Reviews.Count()
                    });
            }
            else
            {
                projectedQuery = query
                    .OrderBy(sc => sc.Name)
                    .Select(sc => new ServiceCenterSummaryDto
                    {
                        Id = sc.Id,
                        Name = sc.Name,
                        Address = sc.Address,
                        Governorate = sc.Gvernorate,
                        Phone = sc.Phone,
                        Type = sc.Type,
                        CoverPhoto = sc.Photos.Select(p => p.PhotoUrl).FirstOrDefault(),
                        ServiceTypes = sc.ServiceTypes.Select(st => st.ServiceType.Name).ToList(),
                        CarBrands = sc.CarBrands.Select(cb => cb.CarBrand.Name).ToList(),
                        AverageRating = sc.Reviews.Any() ? sc.Reviews.Average(r => r.Rating) : 0,
                        ReviewCount = sc.Reviews.Count()
                    });
            }

            var items = await projectedQuery
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<ServiceCenterSummaryDto>(items, totalCount, request.Page, request.PageSize);
        }
    }
}