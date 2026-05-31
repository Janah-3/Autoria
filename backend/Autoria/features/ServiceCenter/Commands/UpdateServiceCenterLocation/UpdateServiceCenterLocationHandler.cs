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
        private readonly GeometryFactory _geometryFactory;

        public UpdateServiceCenterLocationHandler(
            AppDbContext context)
        {
            _context = context;
            _geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        }

        public async Task<Unit> Handle(UpdateServiceCenterLocationCommand request, CancellationToken cancellationToken)
        {
            var serviceCenter = await _context.ServiceCenters
                .FirstOrDefaultAsync(sc => sc.UserId == request.UserId, cancellationToken)
                    ?? throw new NotFoundException("Service center not found");

            serviceCenter.Location = _geometryFactory.CreatePoint(
     new Coordinate(
         request.Longitude,
         request.Latitude
     )
 );

            serviceCenter.Gvernorate = request.Governorate;
            serviceCenter.District = request.District;
            serviceCenter.Address = request.Address;
            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}
