using Autoria.features.JobRequests.DTOs;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.JobRequests.Queries.GetJobRequestDetails
{
    public class GetJobRequestDetailsHandler : IRequestHandler<GetJobRequestDetailsQuery, JobRequestDto>
    {
        private readonly AppDbContext _dbContext;
        private readonly ICurrentUserService _currentUser;

        public GetJobRequestDetailsHandler(AppDbContext dbContext , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _currentUser = currentUser;
        }

        public async Task<JobRequestDto> Handle(GetJobRequestDetailsQuery request, CancellationToken cancellationToken)
        {
            var RequestingUserId = _currentUser.GetUserId();

            var jobRequest = await _dbContext.JobRequests
                .Where(j => j.Id == request.JobRequestId)
                .Where(j => j.CarOwnerId == RequestingUserId
                    || j.Mechanic.UserId == RequestingUserId)
                .Select(j => new JobRequestDto
                {
                    Id = j.Id,
                    CarOwnerName = j.CarOwner.FullName,
                    CarOwnerPhone = j.CarOwner.PhoneNumber!,
                    MechanicName = j.Mechanic.User.FullName,
                    MechanicPhoto = j.Mechanic.ProfilePhotoUrl,
                    CarInfo = $"{j.Car.Year} {j.Car.Make} {j.Car.Model}",
                    ProblemDescription = j.ProblemDescription,
                    Status = j.Status,
                    CancellationReason = j.CancellationReason,
                    RejectionReason = j.RejectionReason,
                    ScheduledAt = j.ScheduledAt,
                    CompletedAt = j.CompletedAt,
                    Price = j.Price,
                    CreatedAt = j.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken)
                    ?? throw new NotFoundException("Job request not found");

            return jobRequest;
        }
    }
}