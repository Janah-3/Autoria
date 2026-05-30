using Autoria.features.Payments.Dtos;
using MediatR;

namespace Autoria.features.Payments.Queries.GetRevenueStats
{
    public record GetRevenueStatsQuery(
        DateTime? DateFrom = null,
        DateTime? DateTo = null,
        Guid? ServiceCenterId = null
    ) : IRequest<RevenueStatsDto>;
}
