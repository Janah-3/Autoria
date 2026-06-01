using Autoria.features.SpareParts.Entities;
using Autoria.features.SpareParts.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Commands.UpdateSparePart
{
    public class UpdateSparePartHandler : IRequestHandler<UpdateSparePartCommand>
    {
        private readonly AppDbContext _db;
        private readonly IImageStorageService _imageStorage;

        public UpdateSparePartHandler(AppDbContext db, IImageStorageService imageStorage)
        {
            _db = db;
            _imageStorage = imageStorage;
        }

        public async Task Handle(UpdateSparePartCommand request, CancellationToken cancellationToken)
        {
            var part = await _db.SpareParts
                .Include(sp => sp.Images)
                .FirstOrDefaultAsync(sp => sp.Id == request.SparePartId, cancellationToken)
                ?? throw new NotFoundException("Spare part not found.");

            var duplicatePartNumber = await _db.SpareParts
                .AnyAsync(sp => sp.PartNumber == request.PartNumber && sp.Id != request.SparePartId, cancellationToken);
            if (duplicatePartNumber)
                throw new ConflictException($"Another spare part with part number '{request.PartNumber}' already exists.");

            // Update fields
            part.Name = request.Name;
            part.Category = request.Category;
            part.Brand = request.Brand;
            part.Model = request.Model;
            part.ProductionDate = request.ProductionDate;
            part.PartNumber = request.PartNumber;
            part.CountryOfOrigin = request.CountryOfOrigin;
            part.Manufacturer = request.Manufacturer;
            part.Description = request.Description;

            if (request.ReplaceAllImages)
            {
                // Delete all existing images from disk and DB
                foreach (var img in part.Images)
                    _imageStorage.DeleteImage(img.Url);

                _db.SparePartImages.RemoveRange(part.Images);
                part.Images.Clear();
            }
            else if (request.ImageUrlsToDelete is { Count: > 0 })
            {
                // Delete specific images
                var toDelete = part.Images
                    .Where(img => request.ImageUrlsToDelete.Contains(img.Url))
                    .ToList();

                foreach (var img in toDelete)
                {
                    _imageStorage.DeleteImage(img.Url);
                    _db.SparePartImages.Remove(img);
                    part.Images.Remove(img);
                }
            }

            // Upload and add new images
            if (request.NewImages is { Count: > 0 })
            {
                foreach (var file in request.NewImages)
                {
                    var url = await _imageStorage.SaveImageAsync(file, cancellationToken);
                    part.Images.Add(new SparePartImage
                    {
                        Id = Guid.NewGuid(),
                        SparePartId = part.Id,
                        Url = url
                    });
                }
            }

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
