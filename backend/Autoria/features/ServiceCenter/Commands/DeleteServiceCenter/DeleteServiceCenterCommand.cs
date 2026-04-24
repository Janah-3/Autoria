using MediatR;

namespace Autoria.features.ServiceCenter.Commands.DeleteServiceCenter
{
    public record DeleteServiceCenterCommand(
      Guid ServiceCenterId
  ) : IRequest<Unit>;
}
