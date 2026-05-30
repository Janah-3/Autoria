using Autoria.features.JobRequests.Enums;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.JobRequests.Commands.AcceptJobRequest
{
    public class AcceptJobRequestHandler : IRequestHandler<AcceptJobRequestCommand>
    {
        private readonly AppDbContext _dbContext;
        private readonly ICurrentUserService _currentUser;

        public AcceptJobRequestHandler(AppDbContext dbContext , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _currentUser = currentUser;
        }

        public async Task Handle(AcceptJobRequestCommand request, CancellationToken cancellationToken)
        {

            var MechanicUserId = _currentUser.GetUserId();

            var mechanic = await _dbContext.MechanicProfiles
                .FirstOrDefaultAsync(m => m.UserId == MechanicUserId, cancellationToken)
                    ?? throw new NotFoundException("Mechanic profile not found");

            var jobRequest = await _dbContext.JobRequests
                .FirstOrDefaultAsync(j => j.Id == request.JobRequestId && j.MechanicId == mechanic.Id, cancellationToken)
                    ?? throw new NotFoundException("Job request not found");

            if (jobRequest.Status != JobRequestStatus.Pending)
                throw new BadRequestException("Only pending job requests can be accepted");

            jobRequest.Status = JobRequestStatus.Accepted;

            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}