using Autoria.shared.Exceptions;
using Autoria.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using Autoria.shared.Contracts;

namespace Autoria.features.Users.Commands.UpdateUserLocation
{
    public class UpdateUserLocationHandler : IRequestHandler<UpdateUserLocationCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly GeometryFactory _geometryFactory;

        public UpdateUserLocationHandler(
            AppDbContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
            _geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        }

        public async Task<Unit> Handle(UpdateUserLocationCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.GetUserId(), cancellationToken)
                ?? throw new NotFoundException("User not found");

            user.Location = _geometryFactory.CreatePoint(
                new Coordinate(request.Longitude, request.Latitude));

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
}