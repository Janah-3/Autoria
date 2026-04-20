using MediatR;

namespace Autoria.features.ServiceCenter.Commands.RejectServiceCenter
{
    public record RejectServiceCenterCommand(
    string AdminId,
    Guid ServiceCenterId,
    string RejectionReason
) : IRequest<Unit>;

}
