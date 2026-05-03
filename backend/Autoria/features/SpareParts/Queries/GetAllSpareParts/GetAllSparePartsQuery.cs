using Autoria.features.SpareParts.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.SpareParts.Queries.GetAllSpareParts
{
    public record GetAllSparePartsQuery(
        SparePartFilterDto Filter,
        bool IncludeInactive = false
    ) : IRequest<PagedResponse<SparePartSummaryDto>>;
}
