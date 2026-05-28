using Autoria.Features.Mechanics.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.Features.Mechanics.Queries.GetPendingMechanics
{
    public record GetPendingMechanicsQuery(int Page, int PageSize) : IRequest<PagedResponse<MechanicSummaryDto>>;
}