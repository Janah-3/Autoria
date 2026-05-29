using MediatR;

namespace Autoria.features.MileageTracking.Commands.LogMileage
{
    public record LogMileageCommand(
        Guid CarId,
        int Mileage,
        string? Notes
    ) : IRequest<Guid>;
}
