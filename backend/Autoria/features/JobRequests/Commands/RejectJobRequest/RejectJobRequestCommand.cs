using MediatR;

namespace Autoria.Features.JobRequests.Commands.RejectJobRequest
{
    public record RejectJobRequestCommand(
        Guid JobRequestId,
        string Reason
    ) : IRequest;
}