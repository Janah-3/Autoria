using MediatR;

namespace Autoria.features.ServiceCenter.Commands.UpdateOperatingHours
{
    public record UpdateOperatingHoursCommand(
     string UserId,
     List<OperatingHoursItemRequest> OperatingHours
 ) : IRequest<Unit>;
}
