using Autoria.Infrastructure.Persistence;
using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Querys.GetPendingServiceCenters
{
    public class GetPendingServiceCentersHandler : IRequestHandler<GetPendingServiceCentersQuery, PagedResponse<PendingServiceCenterDto>>
    {
        private readonly AppDbContext _context;

        public GetPendingServiceCentersHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResponse<PendingServiceCenterDto>> Handle(GetPendingServiceCentersQuery request, CancellationToken cancellationToken)
        {
            var query = _context.ServiceCenters
                .Where(sc => sc.ApprovalStatus == ApprovalStatus.Pending ||
                             sc.ApprovalStatus == ApprovalStatus.UnderReview)
                .OrderBy(sc => sc.SubmittedAt)
                .AsQueryable();

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(sc => new PendingServiceCenterDto
                {
                    Id = sc.Id,
                    Name = sc.Name,
                    OwnerFullName = sc.OwnerFullName,
                    BusinessEmail = sc.BusinessEmail,
                    Phone = sc.Phone,
                    Type = sc.Type,
                    ApprovalStatus = sc.ApprovalStatus,
                    SubmittedAt = sc.SubmittedAt
                })
                .ToListAsync(cancellationToken);

            return new PagedResponse<PendingServiceCenterDto>(items, totalCount, request.Page, request.PageSize);
        }
    }
}
