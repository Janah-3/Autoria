using Autoria.features.SpareParts.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Commands.UpdateSparePart
{
    public class UpdateSparePartHandler : IRequestHandler<UpdateSparePartCommand>
    {
        private readonly AppDbContext _db;

        public UpdateSparePartHandler(AppDbContext db)
        {
            _db = db;
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

            part.Name = request.Name;
            part.Category = request.Category;
            part.Brand = request.Brand;
            part.Model = request.Model;
            part.ProductionDate = request.ProductionDate;
            part.PartNumber = request.PartNumber;
            part.CountryOfOrigin = request.CountryOfOrigin;
            part.Manufacturer = request.Manufacturer;
            part.Description = request.Description;

            // Replace images
            _db.SparePartImages.RemoveRange(part.Images);
            part.Images = request.ImageUrls.Select(url => new SparePartImage
            {
                Id = Guid.NewGuid(),
                SparePartId = part.Id,
                Url = url
            }).ToList();

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
