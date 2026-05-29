using Autoria.features.MileageTracking.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.MileageTracking.Queries.GetMileageHistory
{
    public record GetMileageHistoryQuery(
        Guid CarId,
        int Page = 1,
        int PageSize = 10
    ) : IRequest<PagedResponse<MileageEntryDto>>;
}
