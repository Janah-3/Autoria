using MediatR;

namespace Autoria.features.ServiceCenter.Commands.SubmitServiceCenter
{
    public record SubmitServiceCenterCommand(
     string UserId
 ) : IRequest<Unit>;
}
