using Autoria.features.Inventory.Commands.FlagLowStock;
using Autoria.features.Inventory.Commands.UpdateInventoryStock;
using Autoria.features.Inventory.Commands.UpsertInventory;
using Autoria.features.Inventory.Dtos;
using Autoria.features.Inventory.Queries.GetAllInventory;
using Autoria.features.Inventory.Queries.GetInventoryByCenter;
using Autoria.features.Inventory.Queries.GetInventoryHistory;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Inventory
{
    [ApiController]
    [Route("api/inventory")]
    public class InventoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public InventoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // ── Public ─────────────────────────────────────────────────────────────

        /// <summary>View stock availability for a specific service center</summary>
        [HttpGet]
        public async Task<IActionResult> GetInventoryByCenter(
            [FromQuery] Guid serviceCenterId,
            [FromQuery] bool? isAvailable,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetInventoryByCenterQuery(serviceCenterId, isAvailable, page, pageSize));
            return Ok(ApiResponse<PagedResponse<InventorySummaryDto>>.Ok(result));
        }

        // ── Service Center Owner ───────────────────────────────────────────────

        /// <summary>Add or update a spare part in the center's inventory</summary>
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpsertInventory([FromBody] UpsertInventoryCommand command)
        {
            var inventoryId = await _mediator.Send(command);
            return Ok(ApiResponse<Guid>.Ok(inventoryId, "Inventory updated successfully."));
        }

        // ── Admin — Inventory Oversight ────────────────────────────────────────

        /// <summary>View all inventory across all centers — admin only</summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllInventory(
            [FromQuery] Guid? serviceCenterId,
            [FromQuery] Guid? sparePartId,
            [FromQuery] bool? isFlaggedLowStock,
            [FromQuery] bool? isAvailable,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllInventoryQuery(
                serviceCenterId, sparePartId, isFlaggedLowStock, isAvailable, page, pageSize));
            return Ok(ApiResponse<PagedResponse<InventoryAdminDto>>.Ok(result));
        }

        /// <summary>Edit stock levels for any inventory record — admin only</summary>
        [HttpPut("admin/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStock(Guid id, [FromBody] UpdateInventoryStockRequest request)
        {
            await _mediator.Send(new UpdateInventoryStockCommand(
                id,
                request.Quantity,
                request.Price,
                request.IsAvailable,
                request.LowStockThreshold,
                request.Reason));
            return Ok(ApiResponse<object>.Ok(null!, "Stock updated successfully."));
        }

        /// <summary>Manually flag or unflag low stock — admin only</summary>
        [HttpPatch("admin/{id:guid}/flag-low-stock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> FlagLowStock(Guid id, [FromBody] FlagLowStockRequest request)
        {
            await _mediator.Send(new FlagLowStockCommand(id, request.IsFlagged));
            return Ok(ApiResponse<object>.Ok(null!, request.IsFlagged
                ? "Inventory flagged as low stock."
                : "Low stock flag removed."));
        }

        /// <summary>View inventory change history — admin only</summary>
        [HttpGet("admin/{id:guid}/history")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetInventoryHistory(
            Guid id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetInventoryHistoryQuery(id, page, pageSize));
            return Ok(ApiResponse<PagedResponse<InventoryHistoryDto>>.Ok(result));
        }
    }

    public record UpdateInventoryStockRequest(
        int Quantity,
        decimal Price,
        bool IsAvailable,
        int LowStockThreshold,
        string? Reason);

    public record FlagLowStockRequest(bool IsFlagged);
}
