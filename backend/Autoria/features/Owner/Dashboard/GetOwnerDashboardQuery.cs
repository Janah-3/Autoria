using Autoria.features.Owner.Dashboard.Dtos;
using MediatR;

namespace Autoria.features.Owner.Dashboard
{
    public record GetOwnerDashboardQuery(Guid ServiceCenterId) : IRequest<OwnerDashboardDto>;
}
