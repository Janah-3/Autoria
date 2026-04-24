using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using Autoria.shared.Helpers;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Autoria.features.ServiceCenter.Commands.DeleteServiceCenter
{
    public class DeleteServiceCenterHandler : IRequestHandler<DeleteServiceCenterCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IAdminLogService _logService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteServiceCenterHandler(
            AppDbContext context,
            ICloudinaryService cloudinaryService,
            IAdminLogService logService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _logService = logService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(DeleteServiceCenterCommand request, CancellationToken cancellationToken)
        {
            var adminId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("unauthorized user");

            var serviceCenter = await _context.ServiceCenters
                .Include(sc => sc.Photos)
                .Include(sc => sc.Documents)
                .FirstOrDefaultAsync(sc => sc.Id == request.ServiceCenterId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

          
            foreach (var photo in serviceCenter.Photos)
            {
                var publicId = CloudinaryHelper.ExtractPublicId(photo.PhotoUrl);
                await _cloudinaryService.DeleteImageAsync(publicId);
            }

            
            foreach (var document in serviceCenter.Documents)
            {
                var publicId = CloudinaryHelper.ExtractPublicId(document.FileUrl);
                await _cloudinaryService.DeleteImageAsync(publicId);
            }

            _context.ServiceCenters.Remove(serviceCenter);
            await _context.SaveChangesAsync(cancellationToken);

            await _logService.LogAsync(
                adminId,
                AdminActionType.DeleteServiceCenter,
                AdminTargetType.ServiceCenter,
                serviceCenter.Id.ToString()
            );

            return Unit.Value;
        }

        
    }
}
