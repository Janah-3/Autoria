using MediatR;

namespace Autoria.features.ServiceCenter.Commands.UpdateServiceCenterLocation
{
    public record UpdateServiceCenterLocationCommand(
        Guid ServiceCenterId,
        double Latitude,
        double Longitude,
        string Address
    ) : IRequest<Unit>;
}