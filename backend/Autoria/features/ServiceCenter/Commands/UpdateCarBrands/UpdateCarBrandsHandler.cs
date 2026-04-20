using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.UpdateCarBrands
{
    public class UpdateCarBrandsHandler : IRequestHandler<UpdateCarBrandsCommand, Unit>
    {
        private readonly AppDbContext _context;

        public UpdateCarBrandsHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateCarBrandsCommand request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .Include(sc => sc.CarBrands)
                .FirstOrDefaultAsync(sc => sc.UserId == request.UserId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            if (serviceCenter.ApprovalStatus != ApprovalStatus.Draft)
                throw new BadRequestException("Car brands can only be updated while in draft status");

            var validIds = await _context.CarBrands
                .Where(cb => request.CarBrandIds.Contains(cb.Id))
                .Select(cb => cb.Id)
                .ToListAsync(cancellationToken);

            var invalidIds = request.CarBrandIds.Except(validIds).ToList();

            if (invalidIds.Any())
                throw new BadRequestException($"Invalid car brand IDs: {string.Join(", ", invalidIds)}");

            _context.ServiceCenterCarBrands.RemoveRange(serviceCenter.CarBrands);

            var newCarBrands = request.CarBrandIds.Select(id => new ServiceCenterCarBrand
            {
                Id = Guid.NewGuid(),
                ServiceCenterId = serviceCenter.Id,
                CarBrandId = id
            });

            await _context.ServiceCenterCarBrands.AddRangeAsync(newCarBrands, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
