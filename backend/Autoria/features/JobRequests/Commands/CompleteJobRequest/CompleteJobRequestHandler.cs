// CompleteJobRequestHandler.cs
using Autoria.features.JobRequests.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.JobRequests.Commands.CompleteJobRequest
{
    public class CompleteJobRequestHandler : IRequestHandler<CompleteJobRequestCommand>
    {
        private readonly AppDbContext _dbContext;
        private readonly ICurrentUserService _currentUser;

        public CompleteJobRequestHandler(AppDbContext dbContext , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _currentUser = currentUser;
        }

        public async Task Handle(CompleteJobRequestCommand request, CancellationToken cancellationToken)
        {
            var MechanicUserId = _currentUser.GetUserId();

            var mechanic = await _dbContext.MechanicProfiles
                .FirstOrDefaultAsync(m => m.UserId == MechanicUserId, cancellationToken)
                    ?? throw new NotFoundException("Mechanic profile not found");

            var jobRequest = await _dbContext.JobRequests
                .FirstOrDefaultAsync(j => j.Id == request.JobRequestId && j.MechanicId == mechanic.Id, cancellationToken)
                    ?? throw new NotFoundException("Job request not found");

            if (jobRequest.Status != JobRequestStatus.Accepted)
                throw new BadRequestException("Only accepted job requests can be completed");

            jobRequest.Status = JobRequestStatus.Completed;
            jobRequest.CompletedAt = DateTime.UtcNow;
            jobRequest.Price = request.Price;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}