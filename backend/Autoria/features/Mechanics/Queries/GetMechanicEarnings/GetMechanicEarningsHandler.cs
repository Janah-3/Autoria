using Autoria.features.JobRequests.Enums;
using Autoria.Features.Mechanics.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.Mechanics.Queries.GetMechanicEarnings
{
    public class GetMechanicEarningsHandler : IRequestHandler<GetMechanicEarningsQuery, MechanicEarningsDto>
    {
        private readonly AppDbContext _dbContext;
        private readonly ICurrentUserService _currentUser;

        public GetMechanicEarningsHandler(AppDbContext dbContext , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _currentUser= currentUser;
        }

        public async Task<MechanicEarningsDto> Handle(GetMechanicEarningsQuery request, CancellationToken cancellationToken)
        {
            var MechanicUserId = _currentUser.GetUserId();


            var profile = await _dbContext.MechanicProfiles
                .FirstOrDefaultAsync(m => m.UserId == MechanicUserId, cancellationToken)
                    ?? throw new NotFoundException("Mechanic profile not found");

            var query = _dbContext.JobRequests
                .Where(j => j.MechanicId == profile.Id && j.Status == JobRequestStatus.Completed);

            if (request.From.HasValue)
                query = query.Where(j => DateOnly.FromDateTime(j.CompletedAt!.Value) >= request.From.Value);

            if (request.To.HasValue)
                query = query.Where(j => DateOnly.FromDateTime(j.CompletedAt!.Value) <= request.To.Value);

            var result = await query
                .GroupBy(_ => 1)
                .Select(g => new MechanicEarningsDto
                {
                    TotalEarnings = g.Sum(j => j.Price ?? 0),
                    CompletedJobsCount = g.Count(),
                    From = request.From,
                    To = request.To
                })
                .FirstOrDefaultAsync(cancellationToken);

            return result ?? new MechanicEarningsDto
            {
                TotalEarnings = 0,
                CompletedJobsCount = 0,
                From = request.From,
                To = request.To
            };
        }
    }
}