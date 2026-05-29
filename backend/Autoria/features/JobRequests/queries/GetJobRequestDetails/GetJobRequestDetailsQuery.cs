using Autoria.features.JobRequests.DTOs;
using MediatR;

namespace Autoria.Features.JobRequests.Queries.GetJobRequestDetails
{
    public record GetJobRequestDetailsQuery(Guid JobRequestId) : IRequest<JobRequestDto>;
}