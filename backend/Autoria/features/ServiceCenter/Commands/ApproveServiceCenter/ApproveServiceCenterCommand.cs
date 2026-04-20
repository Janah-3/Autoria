using MediatR;

namespace Autoria.features.ServiceCenter.Commands.ApproveServiceCenter
{
    public record ApproveServiceCenterCommand(
     string AdminId,
     Guid ServiceCenterId
 ) : IRequest<Unit>;
}
