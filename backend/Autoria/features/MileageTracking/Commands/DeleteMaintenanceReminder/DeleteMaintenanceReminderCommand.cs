using MediatR;

namespace Autoria.features.MileageTracking.Commands.DeleteMaintenanceReminder
{
    public record DeleteMaintenanceReminderCommand(Guid ReminderId) : IRequest;
}
