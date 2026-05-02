using Autoria.features.SpareParts.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.SpareParts.Queries.GetSparePartsCatalog
{
    public record GetSparePartsCatalogQuery(SparePartFilterDto Filter) : IRequest<PagedResponse<SparePartSummaryDto>>;
}
