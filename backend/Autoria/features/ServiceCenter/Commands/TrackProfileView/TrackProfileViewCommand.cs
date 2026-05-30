using MediatR;

namespace Autoria.features.ServiceCenter.Commands.TrackProfileView
{
    public record TrackProfileViewCommand(Guid ServiceCenterId) : IRequest;
}
