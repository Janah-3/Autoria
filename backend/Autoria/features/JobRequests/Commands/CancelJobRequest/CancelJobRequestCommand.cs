using MediatR;

namespace Autoria.Features.JobRequests.Commands.CancelJobRequest
{
    public record CancelJobRequestCommand(
        Guid JobRequestId,
        string? CancellationReason
    ) : IRequest;
}