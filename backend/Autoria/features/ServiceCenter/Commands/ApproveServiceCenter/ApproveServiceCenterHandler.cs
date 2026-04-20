using Autoria.Infrastructure.Identity.entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.constants;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.ServiceCenter.Commands.ApproveServiceCenter
{
    public class ApproveServiceCenterHandler : IRequestHandler<ApproveServiceCenterCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IAdminLogService _logService;

        public ApproveServiceCenterHandler(
            AppDbContext context,
            UserManager<User> userManager,
            IAdminLogService logService)
        {
            _context = context;
            _userManager = userManager;
            _logService = logService;
        }

        public async Task<Unit> Handle(ApproveServiceCenterCommand request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .FirstOrDefaultAsync(sc => sc.Id == request.ServiceCenterId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            if (serviceCenter.ApprovalStatus != ApprovalStatus.Pending &&
                serviceCenter.ApprovalStatus != ApprovalStatus.UnderReview)
                throw new BadRequestException("Only pending or under review service centers can be approved");

            serviceCenter.ApprovalStatus = ApprovalStatus.Approved;
            serviceCenter.ApprovedAt = DateTime.UtcNow;

   
            var user = await _userManager.FindByIdAsync(serviceCenter.UserId)
                ?? throw new NotFoundException("User not found");

            if (!await _userManager.IsInRoleAsync(user, Roles.ServiceCenterOwner))
                await _userManager.AddToRoleAsync(user, Roles.ServiceCenterOwner);

            await _context.SaveChangesAsync(cancellationToken);

            await _logService.LogAsync(
                request.AdminId,
                AdminActionType.ApproveServiceCenter,
                AdminTargetType.ServiceCenter,
                serviceCenter.Id.ToString()
            );

            return Unit.Value;
        }
    }
}
