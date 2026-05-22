using Autoria.Infrastructure.Persistence;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Autoria.features.ServiceCenter.Commands.UpdateMyServiceCenter
{
    public class UpdateMyServiceCenterHandler : IRequestHandler<UpdateMyServiceCenterCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateMyServiceCenterHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(UpdateMyServiceCenterCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("unauthorized user");

            var serviceCenter = await _context.ServiceCenters
                .FirstOrDefaultAsync(sc => sc.UserId == userId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            if (serviceCenter.ApprovalStatus != ApprovalStatus.Approved)
                throw new BadRequestException("Only approved service centers can be updated");

            serviceCenter.Name = request.Name ?? serviceCenter.Name;
            serviceCenter.Phone = request.Phone ?? serviceCenter.Phone;
            serviceCenter.BusinessEmail = request.BusinessEmail ?? serviceCenter.BusinessEmail;
            serviceCenter.YearEstablished = request.YearEstablished ?? serviceCenter.YearEstablished;
            serviceCenter.Description = request.Description ?? serviceCenter.Description;
            serviceCenter.NumServiceBays = request.NumServiceBays ?? serviceCenter.NumServiceBays;
            serviceCenter.Type = request.Type ?? serviceCenter.Type;

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
