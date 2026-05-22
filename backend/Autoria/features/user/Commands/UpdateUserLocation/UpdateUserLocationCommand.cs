using MediatR;

namespace Autoria.features.Users.Commands.UpdateUserLocation
{
    public record UpdateUserLocationCommand(
        double Latitude,
        double Longitude
    ) : IRequest<Unit>;
}