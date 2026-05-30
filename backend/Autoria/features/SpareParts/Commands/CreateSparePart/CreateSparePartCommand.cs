using Autoria.features.SpareParts.Entities;
using MediatR;

namespace Autoria.features.SpareParts.Commands.CreateSparePart
{
    public record CompatibilityRequest(string CarMake, string CarModel, int? YearFrom, int? YearTo);

    public record CreateSparePartCommand(
        string Name,
        string Category,
        string Brand,
        string Model,
        DateOnly? ProductionDate,
        string PartNumber,
        string CountryOfOrigin,
        string Manufacturer,
        string? Description,
        List<string> ImageUrls,
        List<CompatibilityRequest>? Compatibilities = null
    ) : IRequest<Guid>;
}
