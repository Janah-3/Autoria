using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.UploadDocuments
{
    public class UploadDocumentsHandler : IRequestHandler<UploadDocumentsCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;

        public UploadDocumentsHandler(AppDbContext context, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Unit> Handle(UploadDocumentsCommand request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .Include(sc => sc.Documents)
                .FirstOrDefaultAsync(sc => sc.UserId == request.UserId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            if (serviceCenter.ApprovalStatus != ApprovalStatus.Draft)
                throw new BadRequestException("Documents can only be uploaded while in draft status");

            // Remove existing documents if re-uploading
            if (serviceCenter.Documents.Any())
            {
                _context.ServiceCenterDocuments.RemoveRange(serviceCenter.Documents);
            }

            var uploads = new[]
            {
            (File: request.CommercialRegFile, Type: DocumentType.CommercialReg),
            (File: request.TaxCardFile,       Type: DocumentType.TaxCard),
            (File: request.OwnerNationalIdFile, Type: DocumentType.NationalId)
        };

            foreach (var (file, type) in uploads)
            {
                var url = await _cloudinaryService.UploadImageAsync(file, "service-center-documents");

                _context.ServiceCenterDocuments.Add(new ServiceCenterDocument
                {
                    Id = Guid.NewGuid(),
                    ServiceCenterId = serviceCenter.Id,
                    DocumentType = type,
                    FileUrl = url,
                    UploadedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
