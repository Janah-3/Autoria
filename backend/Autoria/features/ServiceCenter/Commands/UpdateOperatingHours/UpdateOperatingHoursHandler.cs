using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.UpdateOperatingHours
{
    public class UpdateOperatingHoursHandler : IRequestHandler<UpdateOperatingHoursCommand, Unit>
    {
        private readonly AppDbContext _context;

        public UpdateOperatingHoursHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(UpdateOperatingHoursCommand request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .Include(sc => sc.OperatingHours)
                .FirstOrDefaultAsync(sc => sc.UserId == request.UserId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            //if (serviceCenter.ApprovalStatus != ApprovalStatus.Draft)
            //    throw new BadRequestException("Operating hours can only be updated while in draft status");

            _context.OperatingHours.RemoveRange(serviceCenter.OperatingHours);

            var newHours = request.OperatingHours.Select(h => new OperatingHours
            {
                Id = Guid.NewGuid(),
                ServiceCenterId = serviceCenter.Id,
                Day = h.Day,
                OpenTime = h.IsClosed ? default : h.OpenTime,
                CloseTime = h.IsClosed ? default : h.CloseTime,
                IsClosed = h.IsClosed
            });

            await _context.OperatingHours.AddRangeAsync(newHours, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
