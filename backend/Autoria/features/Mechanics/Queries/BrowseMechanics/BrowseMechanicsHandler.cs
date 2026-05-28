using Autoria.Features.Mechanics.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace Autoria.Features.Mechanics.Queries.BrowseMechanics
{
    public class BrowseMechanicsHandler : IRequestHandler<BrowseMechanicsQuery, PagedResponse<MechanicSummaryDto>>
    {
        private readonly AppDbContext _dbContext;
        private readonly GeometryFactory _geometryFactory;

        public BrowseMechanicsHandler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
            _geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        }

        public async Task<PagedResponse<MechanicSummaryDto>> Handle(BrowseMechanicsQuery request, CancellationToken cancellationToken)
        {
            var query = _dbContext.MechanicProfiles
                .Where(m => m.ApprovalStatus == ApprovalStatus.Approved)
                .AsQueryable();

            if (request.SpecializationId.HasValue)
                query = query.Where(m =>
                    m.Specializations.Any(s => s.ServiceTypeId == request.SpecializationId.Value));

            if (!string.IsNullOrWhiteSpace(request.City))
                query = query.Where(m => m.City.Contains(request.City));

            var totalCount = await query.CountAsync(cancellationToken);

            bool hasLocation = request.Latitude.HasValue && request.Longitude.HasValue;

            IQueryable<MechanicSummaryDto> projectedQuery;

            if (hasLocation)
            {
                var userPoint = _geometryFactory.CreatePoint(
                    new Coordinate(request.Longitude!.Value, request.Latitude!.Value));

                projectedQuery = query
                    .OrderBy(m => m.Location == null)
                    .ThenBy(m => m.Location!.Distance(userPoint))
                    .Select(m => new MechanicSummaryDto
                    {
                        Id = m.Id,
                        FullName = m.User.FullName,
                        ProfilePhotoUrl = m.ProfilePhotoUrl,
                        YearsOfExperience = m.YearsOfExperience,
                        City = m.City,
                        Rating = m.Rating,
                        Specializations = m.Specializations.Select(s => s.ServiceType.Name).ToList(),
                        DistanceInKm = m.Location != null
                            ? m.Location.Distance(userPoint) / 1000
                            : null
                    });
            }
            else
            {
                projectedQuery = query
                    .OrderByDescending(m => m.Rating)
                    .Select(m => new MechanicSummaryDto
                    {
                        Id = m.Id,
                        FullName = m.User.FullName,
                        ProfilePhotoUrl = m.ProfilePhotoUrl,
                        YearsOfExperience = m.YearsOfExperience,
                        City = m.City,
                        Rating = m.Rating,
                        Specializations = m.Specializations.Select(s => s.ServiceType.Name).ToList(),
                        DistanceInKm = null
                    });
            }

            var items = await projectedQuery
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<MechanicSummaryDto>(items, totalCount, request.Page, request.PageSize);
        }
    }
}