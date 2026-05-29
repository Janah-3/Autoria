using Autoria.features.JobRequests.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.JobRequests.Commands.CancelJobRequest
{
    public class CancelJobRequestHandler : IRequestHandler<CancelJobRequestCommand>
    {
        private readonly AppDbContext _dbContext;
        private readonly ICurrentUserService _currentUser;

        public CancelJobRequestHandler(AppDbContext dbContext , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _currentUser = currentUser;
        }

        public async Task Handle(CancelJobRequestCommand request, CancellationToken cancellationToken)
        {
            var CarOwnerId = _currentUser.GetUserId();

            var jobRequest = await _dbContext.JobRequests
                .FirstOrDefaultAsync(j => j.Id == request.JobRequestId && j.CarOwnerId == CarOwnerId, cancellationToken)
                    ?? throw new NotFoundException("Job request not found");

            if (jobRequest.Status == JobRequestStatus.Completed || jobRequest.Status == JobRequestStatus.Cancelled)
                throw new BadRequestException("This job request cannot be cancelled");

            jobRequest.Status = JobRequestStatus.Cancelled;
            jobRequest.CancellationReason = request.CancellationReason;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}