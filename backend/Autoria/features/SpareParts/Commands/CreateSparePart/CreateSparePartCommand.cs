using MediatR;

namespace Autoria.features.SpareParts.Commands.CreateSparePart
{
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
        List<string> ImageUrls
    ) : IRequest<Guid>;
}
