using Autoria.features.JobRequests.DTOs;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.Features.JobRequests.Queries.GetMyJobRequests
{
    public record GetMyJobRequestsQuery(
        string? Status,
        int Page,
        int PageSize
    ) : IRequest<PagedResponse<JobRequestSummaryDto>>;
}