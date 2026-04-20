using Autoria.features.ServiceCenter.Dtos;
using MediatR;

namespace Autoria.features.ServiceCenter.Querys.GetMyServiceCenter
{
    public record GetMyServiceCenterQuery : IRequest<ServiceCenterDetailDto>;
}
