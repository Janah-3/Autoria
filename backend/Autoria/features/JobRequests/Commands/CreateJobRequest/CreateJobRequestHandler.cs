using Autoria.features.JobRequests.Enums;
using Autoria.Features.JobRequests.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.JobRequests.Commands.CreateJobRequest
{
    public class CreateJobRequestHandler : IRequestHandler<CreateJobRequestCommand, Guid>
    {
        private readonly AppDbContext _dbContext;
        private readonly ICurrentUserService _currentUser;

        public CreateJobRequestHandler(AppDbContext dbContext , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _currentUser = currentUser;
        }

        public async Task<Guid> Handle(CreateJobRequestCommand request, CancellationToken cancellationToken)
        {
            var CarOwnerId = _currentUser.GetUserId();

            var mechanic = await _dbContext.MechanicProfiles
                .FirstOrDefaultAsync(m => m.Id == request.MechanicId, cancellationToken)
                    ?? throw new NotFoundException("Mechanic not found");

            if (mechanic.ApprovalStatus != ApprovalStatus.Approved)
                throw new BadRequestException("This mechanic is not available");

            var car = await _dbContext.Cars
                .FirstOrDefaultAsync(c => c.CarId == request.CarId && c.UserId ==CarOwnerId, cancellationToken)
                    ?? throw new NotFoundException("Car not found");

            var jobRequest = new JobRequest
            {
                Id = Guid.NewGuid(),
                CarOwnerId = CarOwnerId,
                MechanicId = request.MechanicId,
                CarId = request.CarId,
                ProblemDescription = request.ProblemDescription,
                LocationAddress = request.LocationAddress,
                Status = JobRequestStatus.Pending,
                ScheduledAt = request.ScheduledAt,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.JobRequests.AddAsync(jobRequest, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return jobRequest.Id;
        }
    }
}