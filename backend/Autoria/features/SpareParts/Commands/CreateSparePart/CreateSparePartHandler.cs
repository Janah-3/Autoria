using System.Security.Claims;
using Autoria.features.SpareParts.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.SpareParts.Commands.CreateSparePart
{
    public class CreateSparePartHandler : IRequestHandler<CreateSparePartCommand, Guid>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateSparePartHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(CreateSparePartCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var duplicate = await _db.SpareParts
                .AnyAsync(sp => sp.PartNumber == request.PartNumber, cancellationToken);
            if (duplicate)
                throw new ConflictException($"A spare part with part number '{request.PartNumber}' already exists.");

            var part = new SparePart
            {
                Id = Guid.NewGuid(),
                CreatedById = userId,
                Name = request.Name,
                Category = request.Category,
                Brand = request.Brand,
                Model = request.Model,
                ProductionDate = request.ProductionDate,
                PartNumber = request.PartNumber,
                CountryOfOrigin = request.CountryOfOrigin,
                Manufacturer = request.Manufacturer,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow,
                Images = request.ImageUrls.Select(url => new SparePartImage
                {
                    Id = Guid.NewGuid(),
                    Url = url
                }).ToList(),
                Compatibilities = (request.Compatibilities ?? new()).Select(c => new SparePartCompatibility
                {
                    Id = Guid.NewGuid(),
                    CarMake = c.CarMake,
                    CarModel = c.CarModel,
                    YearFrom = c.YearFrom,
                    YearTo = c.YearTo
                }).ToList()
            };

            _db.SpareParts.Add(part);
            await _db.SaveChangesAsync(cancellationToken);

            return part.Id;
        }
    }
}
