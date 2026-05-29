using Autoria.features.MileageTracking.Commands.DeleteMaintenanceReminder;
using Autoria.features.MileageTracking.Commands.LogMileage;
using Autoria.features.MileageTracking.Commands.SetMaintenanceReminder;
using Autoria.features.MileageTracking.Dtos;
using Autoria.features.MileageTracking.Queries.GetMaintenanceReminders;
using Autoria.features.MileageTracking.Queries.GetMileageHistory;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.MileageTracking
{
    [ApiController]
    [Route("api/mileage")]
    [Authorize]
    public class MileageTrackingController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MileageTrackingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ── Mileage Entries ────────────────────────────────────────────────────

        /// <summary>Log a new mileage entry for a car — triggers reminders if threshold reached</summary>
        [HttpPost]
        public async Task<IActionResult> LogMileage([FromBody] LogMileageCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(ApiResponse<Guid>.Ok(id, "Mileage logged successfully."));
        }

        /// <summary>View mileage history for a specific car</summary>
        [HttpGet("{carId:guid}/history")]
        public async Task<IActionResult> GetMileageHistory(
            Guid carId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetMileageHistoryQuery(carId, page, pageSize));
            return Ok(ApiResponse<PagedResponse<MileageEntryDto>>.Ok(result));
        }

        // ── Maintenance Reminders ──────────────────────────────────────────────

        /// <summary>Set a maintenance reminder triggered by mileage threshold</summary>
        [HttpPost("reminders")]
        public async Task<IActionResult> SetReminder([FromBody] SetMaintenanceReminderCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(ApiResponse<Guid>.Ok(id, "Maintenance reminder set successfully."));
        }

        /// <summary>Get all active reminders — filter by car or triggered status</summary>
        [HttpGet("reminders")]
        public async Task<IActionResult> GetReminders(
            [FromQuery] Guid? carId,
            [FromQuery] bool? isTriggered)
        {
            var result = await _mediator.Send(new GetMaintenanceRemindersQuery(carId, isTriggered));
            return Ok(ApiResponse<List<MaintenanceReminderDto>>.Ok(result));
        }

        /// <summary>Delete (deactivate) a maintenance reminder</summary>
        [HttpDelete("reminders/{id:guid}")]
        public async Task<IActionResult> DeleteReminder(Guid id)
        {
            await _mediator.Send(new DeleteMaintenanceReminderCommand(id));
            return Ok(ApiResponse<object>.Ok(null!, "Reminder deleted successfully."));
        }
    }
}
