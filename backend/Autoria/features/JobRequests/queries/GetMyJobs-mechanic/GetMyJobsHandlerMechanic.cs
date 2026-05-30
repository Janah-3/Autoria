using Autoria.features.JobRequests.DTOs;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.JobRequests.Queries.GetMyJobs
{
    public class GetMyJobsHandlerMechanic : IRequestHandler<GetMyJobsQueryMechanic, PagedResponse<JobRequestSummaryDto>>
    {
        private readonly AppDbContext _dbContext;
        private readonly ICurrentUserService _currentUser;

        public GetMyJobsHandlerMechanic(AppDbContext dbContext , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _currentUser = currentUser;
        }

        public async Task<PagedResponse<JobRequestSummaryDto>> Handle(GetMyJobsQueryMechanic request, CancellationToken cancellationToken)
        {

            var MechanicUserId = _currentUser.GetUserId();

            var query = _dbContext.JobRequests
                .Where(j => j.Mechanic.UserId == MechanicUserId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Status))
                query = query.Where(j => j.Status == request.Status);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(j => j.CreatedAt)
                .Select(j => new JobRequestSummaryDto
                {
                    Id = j.Id,
                    MechanicName = j.Mechanic.User.FullName,
                    MechanicPhoto = j.Mechanic.ProfilePhotoUrl,
                    CarInfo = $"{j.Car.Year} {j.Car.Make} {j.Car.Model}",
                    ProblemDescription = j.ProblemDescription,
                    Status = j.Status,
                    ScheduledAt = j.ScheduledAt,
                    CreatedAt = j.CreatedAt
                })
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResponse<JobRequestSummaryDto>(items, totalCount, request.Page, request.PageSize);
        }
    }
}