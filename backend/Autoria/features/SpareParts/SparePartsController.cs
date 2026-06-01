using Autoria.features.SpareParts.Commands.CreateSparePart;
using Autoria.features.SpareParts.Commands.DeleteSparePart;
using Autoria.features.SpareParts.Commands.UpdateSparePart;
using Autoria.features.SpareParts.Dtos;
using Autoria.features.SpareParts.Queries.GetAllSpareParts;
using Autoria.features.SpareParts.Queries.GetCategories;
using Autoria.features.SpareParts.Queries.GetSparePartById;
using Autoria.features.SpareParts.Queries.GetSparePartsCatalog;

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

        /// <summary>Browse & search spare parts catalog — supports car compatibility filter</summary>
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

        /// <summary>
        /// Add a new spare part — admin only.
        /// Use multipart/form-data. Attach images as "images" field.
        /// Compatibilities as JSON string: [{"carMake":"Toyota","carModel":"Corolla","yearFrom":2018,"yearTo":2023}]
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateSparePart([FromForm] CreateSparePartFormRequest request)
        {
            var compatibilities = string.IsNullOrWhiteSpace(request.CompatibilitiesJson)
                ? null
                : System.Text.Json.JsonSerializer.Deserialize<List<CompatibilityRequest>>(
                    request.CompatibilitiesJson,
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            var command = new CreateSparePartCommand(
                request.Name,
                request.Category,
                request.Brand,
                request.Model,
                request.ProductionDate,
                request.PartNumber,
                request.CountryOfOrigin,
                request.Manufacturer,
                request.Description,
                request.Images ?? new FormFileCollection(),
                compatibilities);

            var partId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetSparePartById), new { id = partId },
                ApiResponse<Guid>.Ok(partId, "Spare part created successfully."));
        }

        /// <summary>
        /// Edit a spare part — admin only.
        /// Use multipart/form-data.
        /// NewImages: files to add. ImageUrlsToDeleteJson: JSON array of URLs to remove.
        /// ReplaceAllImages=true: replaces everything.
        /// </summary>
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateSparePart(Guid id, [FromForm] UpdateSparePartFormRequest request)
        {
            var urlsToDelete = string.IsNullOrWhiteSpace(request.ImageUrlsToDeleteJson)
                ? null
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(request.ImageUrlsToDeleteJson);

            var command = new UpdateSparePartCommand(
                id,
                request.Name,
                request.Category,
                request.Brand,
                request.Model,
                request.ProductionDate,
                request.PartNumber,
                request.CountryOfOrigin,
                request.Manufacturer,
                request.Description,
                request.NewImages,
                urlsToDelete,
                request.ReplaceAllImages);

            await _mediator.Send(command);
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
}
