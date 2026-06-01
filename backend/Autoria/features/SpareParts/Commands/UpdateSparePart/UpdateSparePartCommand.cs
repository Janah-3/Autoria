using MediatR;

namespace Autoria.features.SpareParts.Commands.UpdateSparePart
{
    public record UpdateSparePartCommand(
        Guid SparePartId,
        string Name,
        string Category,
        string Brand,
        string Model,
        DateOnly? ProductionDate,
        string PartNumber,
        string CountryOfOrigin,
        string Manufacturer,
        string? Description,
        IFormFileCollection? NewImages,      // new images to add
        List<string>? ImageUrlsToDelete,     // existing image URLs to remove
        bool ReplaceAllImages = false        // if true: delete all old images and replace with NewImages
    ) : IRequest;
}
