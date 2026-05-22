using Autoria.features.MileageTracking.Dtos;
using MediatR;

namespace Autoria.features.MileageTracking.Queries.GetMaintenanceReminders
{
    public record GetMaintenanceRemindersQuery(
        Guid? CarId = null,
        bool? IsTriggered = null
    ) : IRequest<List<MaintenanceReminderDto>>;
}
