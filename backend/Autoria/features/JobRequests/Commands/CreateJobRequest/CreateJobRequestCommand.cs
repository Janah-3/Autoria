using MediatR;

namespace Autoria.Features.JobRequests.Commands.CreateJobRequest
{
    public record CreateJobRequestCommand(
        Guid MechanicId,
        Guid CarId,
        string ProblemDescription,
        string LocationAddress,
        DateTime? ScheduledAt
    ) : IRequest<Guid>;
}