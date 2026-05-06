using Autoria.shared.Exceptions;
using Autoria.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using Autoria.shared.Contracts;

namespace Autoria.features.ServiceCenter.Commands.UpdateServiceCenterLocation
{
    public class UpdateServiceCenterLocationHandler : IRequestHandler<UpdateServiceCenterLocationCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly GeometryFactory _geometryFactory;

        public UpdateServiceCenterLocationHandler(
            AppDbContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
            _geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        }

        public async Task<Unit> Handle(UpdateServiceCenterLocationCommand request, CancellationToken cancellationToken)
        {

            var userId = _currentUserService.GetUserId();

            var serviceCenter = await _context.ServiceCenters
               .FirstOrDefaultAsync(sc => sc.UserId == userId, cancellationToken)
               ?? throw new NotFoundException("Service center not found");

            if (serviceCenter.ApprovalStatus != shared.Enums.ApprovalStatus.Draft)
                throw new BadRequestException("Location can only be updated while the service center is in draft");

            serviceCenter.Location = _geometryFactory.CreatePoint(
                new Coordinate(request.Longitude, request.Latitude)); // X = lng, Y = lat

            serviceCenter.Address = request.Address;

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}
