using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.UploadPhotos
{
    public class UploadPhotosHandler : IRequestHandler<UploadPhotosCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;

        public UploadPhotosHandler(AppDbContext context, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<Unit> Handle(UploadPhotosCommand request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .Include(sc => sc.Photos)
                .FirstOrDefaultAsync(sc => sc.UserId == request.UserId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            if (serviceCenter.ApprovalStatus != ApprovalStatus.Draft)
                throw new BadRequestException("Photos can only be uploaded while in draft status");

            
            foreach (var existingPhoto in serviceCenter.Photos)
            {
                var publicId = ExtractPublicId(existingPhoto.PhotoUrl);
                await _cloudinaryService.DeleteImageAsync(publicId);
            }

            _context.ServiceCenterPhotos.RemoveRange(serviceCenter.Photos);

            
            foreach (var photo in request.Photos)
            {
                var url = await _cloudinaryService.UploadImageAsync(photo, "service-center-photos");

                await _context.ServiceCenterPhotos.AddAsync(new ServiceCenterPhoto
                {
                    Id = Guid.NewGuid(),
                    ServiceCenterId = serviceCenter.Id,
                    PhotoUrl = url,
                    UploadedAt = DateTime.UtcNow
                }, cancellationToken);
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }

        private string ExtractPublicId(string url)
        {
            // Cloudinary URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{publicId}.{ext}
            var uri = new Uri(url);
            var segments = uri.AbsolutePath.Split('/');
            var uploadIndex = Array.IndexOf(segments, "upload");
            var relevantSegments = segments.Skip(uploadIndex + 2); // skip "upload" and version
            var publicIdWithExt = string.Join("/", relevantSegments);
            return Path.ChangeExtension(publicIdWithExt, null); // remove extension
        }
    }
}
