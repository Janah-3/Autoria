using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.UpdateServiceTypes
{
    public class UpdateServiceTypesHandler : IRequestHandler<UpdateServiceTypesCommand, Unit>
    {
        private readonly AppDbContext _context;

        public UpdateServiceTypesHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateServiceTypesCommand request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .Include(sc => sc.ServiceTypes)
                .FirstOrDefaultAsync(sc => sc.UserId == request.UserId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            if (serviceCenter.ApprovalStatus != ApprovalStatus.Draft)
                throw new BadRequestException("Service types can only be updated while in draft status");

            // Validate all IDs exist in the lookup table
            var validIds = await _context.ServiceTypes
                .Where(st => request.ServiceTypeIds.Contains(st.ServiceTypeId))
                .Select(st => st.ServiceTypeId)
                .ToListAsync(cancellationToken);

            var invalidIds = request.ServiceTypeIds.Except(validIds).ToList();

            if (invalidIds.Any())
                throw new BadRequestException($"Invalid service type IDs: {string.Join(", ", invalidIds)}");

            
            _context.ServiceCenterServiceTypes.RemoveRange(serviceCenter.ServiceTypes);

            var newServiceTypes = request.ServiceTypeIds.Select(id => new ServiceCenterServiceType
            {
                Id = Guid.NewGuid(),
                ServiceCenterId = serviceCenter.Id,
                ServiceTypeId = id
            });

            await _context.ServiceCenterServiceTypes.AddRangeAsync(newServiceTypes, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
