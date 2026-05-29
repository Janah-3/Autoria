using MediatR;

namespace Autoria.features.MileageTracking.Commands.SetMaintenanceReminder
{
    public record SetMaintenanceReminderCommand(
        Guid CarId,
        string Title,
        int MileageThreshold
    ) : IRequest<Guid>;
}
