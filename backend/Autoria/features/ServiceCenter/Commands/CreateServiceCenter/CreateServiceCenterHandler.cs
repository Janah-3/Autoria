using Autoria.Infrastructure.Persistence;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.CreateServiceCenter
{
    public class CreateServiceCenterHandler : IRequestHandler<CreateServiceCenterCommand, Guid>
    {
        private readonly AppDbContext _context;

        public CreateServiceCenterHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateServiceCenterCommand request, CancellationToken cancellationToken)
        {
            var alreadyExists = await _context.ServiceCenters
                .AnyAsync(sc => sc.UserId == request.UserId, cancellationToken);

            if (alreadyExists)
                throw new BadRequestException("You already have a service center");

            var serviceCenter = new Entities.ServiceCenter
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Name = request.Name,
                Phone = request.Phone,
                BusinessEmail = request.BusinessEmail,
                YearEstablished = request.YearEstablished,
                Description = request.Description,
                CommercialRegNo = request.CommercialRegNo,
                TaxCardNo = request.TaxCardNo,
                OwnerNationalId = request.OwnerNationalId,
                OwnerFullName = request.OwnerFullName,
                NumServiceBays = request.NumServiceBays,
                Type = request.Type,               
                ApprovalStatus = ApprovalStatus.Draft,
                CreatedAt = DateTime.UtcNow,
                SubmittedAt = DateTime.UtcNow
            };

            _context.ServiceCenters.Add(serviceCenter);
            await _context.SaveChangesAsync(cancellationToken);

            return serviceCenter.Id;
        }
    }
}
