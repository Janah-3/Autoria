using MediatR;

namespace Autoria.Features.JobRequests.Commands.CompleteJobRequest
{
    public record CompleteJobRequestCommand(
        Guid JobRequestId,
        decimal Price
    ) : IRequest;
}