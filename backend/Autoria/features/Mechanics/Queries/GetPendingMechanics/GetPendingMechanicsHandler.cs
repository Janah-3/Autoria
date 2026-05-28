using Autoria.Features.Mechanics.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.Mechanics.Queries.GetPendingMechanics
{
    public class GetPendingMechanicsHandler : IRequestHandler<GetPendingMechanicsQuery, PagedResponse<MechanicSummaryDto>>
    {
        private readonly AppDbContext _dbContext;

        public GetPendingMechanicsHandler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<PagedResponse<MechanicSummaryDto>> Handle(GetPendingMechanicsQuery request, CancellationToken cancellationToken)
        {
            var query = _dbContext.MechanicProfiles
                .Where(m => m.ApprovalStatus == ApprovalStatus.Pending)
                .OrderBy(m => m.CreatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Select(m => new MechanicSummaryDto
                {
                    Id = m.Id,
                    FullName = m.User.FullName,
                    ProfilePhotoUrl = m.ProfilePhotoUrl,
                    YearsOfExperience = m.YearsOfExperience,
                    City = m.City,
                    Rating = m.Rating,
                    Specializations = m.Specializations.Select(s => s.ServiceType.Name).ToList()
                })
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<MechanicSummaryDto>(items, totalCount, request.Page, request.PageSize);
        }
    }
}