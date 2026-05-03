using Autoria.features.SpareParts.Commands.CancelReservation;
using Autoria.features.SpareParts.Commands.CreateSparePart;
using Autoria.features.SpareParts.Commands.DeleteSparePart;
using Autoria.features.SpareParts.Commands.ReservePart;
using Autoria.features.SpareParts.Commands.UpdateSparePart;
using Autoria.features.SpareParts.Dtos;
using Autoria.features.SpareParts.Enums;
using Autoria.features.SpareParts.Queries.GetAllSpareParts;
using Autoria.features.SpareParts.Queries.GetCategories;
using Autoria.features.SpareParts.Queries.GetSparePartById;
using Autoria.features.SpareParts.Queries.GetSparePartsCatalog;
using Autoria.features.SpareParts.Queries.GetUserReservations;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.SpareParts
{
    [ApiController]
    [Route("api/spare-parts")]
    public class SparePartsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SparePartsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ── Catalog (public) ───────────────────────────────────────────────────

        /// <summary>Browse & search spare parts catalog</summary>
        [HttpGet]
        public async Task<IActionResult> GetCatalog([FromQuery] SparePartFilterDto filter)
        {
            var result = await _mediator.Send(new GetSparePartsCatalogQuery(filter));
            return Ok(ApiResponse<PagedResponse<SparePartSummaryDto>>.Ok(result));
        }

        /// <summary>View spare part details + availability across all centers</summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetSparePartById(Guid id)
        {
            var result = await _mediator.Send(new GetSparePartByIdQuery(id));
            return Ok(ApiResponse<SparePartDetailDto>.Ok(result));
        }

        /// <summary>Get all distinct categories — used for filter dropdowns</summary>
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _mediator.Send(new GetCategoriesQuery());
            return Ok(ApiResponse<List<string>>.Ok(result));
        }

        // ── Reservations (authenticated users) ────────────────────────────────

        /// <summary>Reserve a spare part online</summary>
        [HttpPost("reserve")]
        [Authorize]
        public async Task<IActionResult> ReservePart([FromBody] ReservePartCommand command)
        {
            var reservationId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetMyReservations), new { },
                ApiResponse<Guid>.Ok(reservationId, "Part reserved successfully. Expires in 24 hours."));
        }

        /// <summary>View current user's reservations</summary>
        [HttpGet("reservations")]
        [Authorize]
        public async Task<IActionResult> GetMyReservations(
            [FromQuery] ReservationStatus? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetUserReservationsQuery(status, page, pageSize));
            return Ok(ApiResponse<PagedResponse<ReservationDto>>.Ok(result));
        }

        /// <summary>Cancel a reservation — restores stock</summary>
        [HttpPatch("reservations/{id:guid}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelReservation(Guid id, [FromBody] CancelReservationRequest request)
        {
            await _mediator.Send(new CancelReservationCommand(id, request.Reason));
            return Ok(ApiResponse<object>.Ok(null!, "Reservation cancelled successfully."));
        }

        // ── Admin — Catalog Management ─────────────────────────────────────────

        /// <summary>List all parts including inactive — admin only</summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPartsAdmin(
            [FromQuery] SparePartFilterDto filter,
            [FromQuery] bool includeInactive = false)
        {
            var result = await _mediator.Send(new GetAllSparePartsQuery(filter, includeInactive));
            return Ok(ApiResponse<PagedResponse<SparePartSummaryDto>>.Ok(result));
        }

        /// <summary>Add a new spare part to the catalog — admin only</summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSparePart([FromBody] CreateSparePartCommand command)
        {
            var partId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetSparePartById), new { id = partId },
                ApiResponse<Guid>.Ok(partId, "Spare part created successfully."));
        }

        /// <summary>Edit a spare part — admin only</summary>
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSparePart(Guid id, [FromBody] UpdateSparePartCommand command)
        {
            await _mediator.Send(command with { SparePartId = id });
            return Ok(ApiResponse<object>.Ok(null!, "Spare part updated successfully."));
        }

        /// <summary>Soft delete a spare part — admin only</summary>
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSparePart(Guid id)
        {
            await _mediator.Send(new DeleteSparePartCommand(id));
            return Ok(ApiResponse<object>.Ok(null!, "Spare part deleted successfully."));
        }
    }

    public record CancelReservationRequest(string? Reason);
}
