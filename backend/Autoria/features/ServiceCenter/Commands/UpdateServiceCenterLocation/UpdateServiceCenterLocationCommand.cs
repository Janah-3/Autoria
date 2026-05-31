using Autoria.Infrastructure.Identity.entities;
using MediatR;

namespace Autoria.features.ServiceCenter.Commands.UpdateServiceCenterLocation
{
    public record UpdateServiceCenterLocationCommand(
    string UserId,
    double Latitude,
    double Longitude,
    string Governorate,
    string District,
    string Address
) : IRequest<Unit>;
}