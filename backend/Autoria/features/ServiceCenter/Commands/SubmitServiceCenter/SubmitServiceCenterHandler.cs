using Autoria.Infrastructure.Persistence;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.SubmitServiceCenter
{
    public class SubmitServiceCenterHandler : IRequestHandler<SubmitServiceCenterCommand, Unit>
    {
        private readonly AppDbContext _context;

        public SubmitServiceCenterHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(SubmitServiceCenterCommand request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .Include(sc => sc.Documents)
                .Include(sc => sc.ServiceTypes)
                .Include(sc => sc.CarBrands)
                .Include(sc => sc.OperatingHours)
                .Include(sc => sc.Photos)
                .FirstOrDefaultAsync(sc => sc.UserId == request.UserId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            if (serviceCenter.ApprovalStatus != ApprovalStatus.Draft)
                throw new BadRequestException("Only draft service centers can be submitted");

            // Validate all steps are completed
            var errors = new List<string>();

            if (!serviceCenter.Documents.Any())
                errors.Add("Documents are required");

            if (serviceCenter.Documents.Count < 3)
                errors.Add("All three documents must be uploaded");

            if (!serviceCenter.ServiceTypes.Any())
                errors.Add("At least one service type is required");

            if (!serviceCenter.CarBrands.Any())
                errors.Add("At least one car brand is required");

            if (serviceCenter.OperatingHours.Count != 7)
                errors.Add("Operating hours for all 7 days are required");

            if (serviceCenter.Photos.Count < 3)
                errors.Add("At least 3 photos are required");

            if (errors.Any())
                throw new BadRequestException("Submission incomplete", errors);

            serviceCenter.ApprovalStatus = ApprovalStatus.Pending;
            serviceCenter.SubmittedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
