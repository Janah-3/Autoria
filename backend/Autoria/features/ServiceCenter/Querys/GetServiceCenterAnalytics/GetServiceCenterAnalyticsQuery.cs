using Autoria.features.ServiceCenter.Dtos;
using MediatR;

namespace Autoria.features.ServiceCenter.Querys.GetServiceCenterAnalytics
{

    public record GetServiceCenterAnalyticsQuery(Guid ServiceCenterId) : IRequest<ServiceCenterAnalyticsDto>;
}
