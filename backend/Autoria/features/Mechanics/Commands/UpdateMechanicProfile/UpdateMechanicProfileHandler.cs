using Autoria.Infrastructure.Email.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace Autoria.Features.Mechanics.Commands.UpdateMechanicProfile
{
    public class UpdateMechanicProfileHandler : IRequestHandler<UpdateMechanicProfileCommand, Unit>
    {
        private readonly AppDbContext _dbContext;
        private readonly ICloudinaryService _cloudinary;
        private readonly GeometryFactory _geometryFactory;
        private readonly ICurrentUserService _currentUser;

        public UpdateMechanicProfileHandler(AppDbContext dbContext, ICloudinaryService cloudinary , ICurrentUserService currentUser)
        {
            _dbContext = dbContext;
            _cloudinary = cloudinary;
            _geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
            _currentUser = currentUser;
        }

        public async Task<Unit> Handle(UpdateMechanicProfileCommand request, CancellationToken cancellationToken)
        {
            var MechanicUserId = _currentUser.GetUserId();
            var profile = await _dbContext.MechanicProfiles
                .Include(m => m.Specializations)
                .FirstOrDefaultAsync(m => m.UserId == MechanicUserId, cancellationToken)
                    ?? throw new NotFoundException("Mechanic profile not found");

            if (request.City is not null)
                profile.City = request.City;

            if (request.YearsOfExperience.HasValue)
                profile.YearsOfExperience = request.YearsOfExperience.Value;

            if (request.Latitude.HasValue && request.Longitude.HasValue)
                profile.Location = _geometryFactory.CreatePoint(
                    new Coordinate(request.Longitude.Value, request.Latitude.Value));

            if (request.ProfilePhoto is not null)
                profile.ProfilePhotoUrl = await _cloudinary
             .UploadImageAsync(request.ProfilePhoto, "mechanic_photos");


            if (request.SpecializationIds is not null)
            {
                profile.Specializations.Clear();
                profile.Specializations = request.SpecializationIds.Select(id => new MechanicSpecialization
                {
                    MechanicProfileId = profile.Id,
                    ServiceTypeId = id
                }).ToList();
            }

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }

       
    }
}