using Autoria.Features.Mechanics.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.Features.Mechanics.Queries.BrowseMechanics
{
    public record BrowseMechanicsQuery(
        Guid? SpecializationId,
        string? City,
        double? Latitude,
        double? Longitude,
        int Page,
        int PageSize
    ) : IRequest<PagedResponse<MechanicSummaryDto>>;
}