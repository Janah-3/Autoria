using Autoria.features.PartReservations.Commands.CancelReservation;
using Autoria.features.PartReservations.Commands.MarkAsPickedUp;
using Autoria.features.PartReservations.Commands.ReservePart;
using Autoria.features.PartReservations.Dtos;
using Autoria.features.PartReservations.Enums;
using Autoria.features.PartReservations.Queries.GetMyReservations;
using Autoria.features.PartReservations.Queries.GetServiceCenterReservations;
using Autoria.features.SpareParts;
using Autoria.shared.constants;
using Autoria.shared.Controllers;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.PartReservations
{
    public class PartReservationsController : BaseController
    {
        public PartReservationsController(IMediator mediator) : base(mediator) { }

        /// <summary>Reserve a spare part online</summary>
        [HttpPost("reserve")]
        [Authorize]
        public async Task<IActionResult> ReservePart([FromBody] ReservePartCommand command)
        {
            var reservationId = await _mediator.Send(command);
            return Ok(ApiResponse<Guid>.Ok(reservationId, "Part reserved successfully. Expires in 24 hours."));
        }
        /// <summary>Cancel a reservation — restores stock</summary>
        [HttpPatch("reservations/{id:guid}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelReservation(Guid id, [FromBody] CancelReservationRequest request)
        {
            await _mediator.Send(new CancelReservationCommand(id, request.Reason));
            return Ok(ApiResponse<object>.Ok(null!, "Reservation cancelled successfully."));
        }

        [HttpPatch("{id:guid}/pickup")]
        [Authorize(Roles = Roles.ServiceCenterOwner)]
        public async Task<IActionResult> MarkAsPickedUp(Guid id)
        {
            await _mediator.Send(new MarkAsPickedUpCommand(id));
            return Ok(ApiResponse<object>.Ok(null!, "Reservation marked as picked up."));
        }

        [HttpGet("my")]
        [Authorize (Roles = Roles.User)]
        public async Task<IActionResult> GetMyReservations(
            [FromQuery] ReservationStatus? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetMyReservationsQuery(status, page, pageSize));
            return Ok(ApiResponse<PagedResponse<ReservationDto>>.Ok(result));
        }

        [HttpGet("service-center")]
        [Authorize(Roles = Roles.ServiceCenterOwner)]
        public async Task<IActionResult> GetServiceCenterReservations(
            [FromQuery] ReservationStatus? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetServiceCenterReservationsQuery(status, page, pageSize));
            return Ok(ApiResponse<PagedResponse<ReservationDto>>.Ok(result));
        }
    }
    public record CancelReservationRequest(string? Reason);
}