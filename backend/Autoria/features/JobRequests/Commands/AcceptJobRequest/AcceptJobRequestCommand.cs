using MediatR;

namespace Autoria.Features.JobRequests.Commands.AcceptJobRequest
{
    public record AcceptJobRequestCommand(Guid JobRequestId) : IRequest;
}