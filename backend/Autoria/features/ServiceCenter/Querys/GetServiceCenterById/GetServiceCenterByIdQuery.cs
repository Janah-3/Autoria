using Autoria.features.ServiceCenter.Dtos;
using MediatR;

namespace Autoria.features.ServiceCenter.Querys.GetServiceCenterById
{
    public record GetServiceCenterByIdQuery(Guid ServiceCenterId) : IRequest<ServiceCenterDetailDto>;
}
