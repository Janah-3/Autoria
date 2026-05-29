using Autoria.features.Mechanics.Dtos;
using Autoria.Features.Mechanics.Entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Mechanics.Queries.GetMyProfile
{
    public class GetMyProfileHandler : IRequestHandler<GetMyProfileQuery, mechanicPersonalProfile>
    {
        private readonly ICurrentUserService _currentUser;
        private AppDbContext _dbContext;

        public GetMyProfileHandler( ICurrentUserService currentUser, AppDbContext dbContext)
        {
            _currentUser = currentUser;
            _dbContext = dbContext;
        }
        public async Task<mechanicPersonalProfile> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
        {
           var mechanicId = _currentUser.GetUserId();
            var mechanicData = await _dbContext.MechanicProfiles
      .Include(m => m.User)
      .FirstOrDefaultAsync(m => m.UserId == mechanicId)
      ?? throw new NotFoundException("mechanic profile not found");

            double rating = mechanicData.Rating;

            if (double.IsNaN(rating) || double.IsInfinity(rating))
            {
                rating = 0;
            }

            return new mechanicPersonalProfile
            {
                City = mechanicData.City,
                Name = mechanicData.User.FullName,
                PhoneNumber = mechanicData.User.PhoneNumber,
                Rating = rating,
                Latitude = mechanicData.Location?.Y,
                Longitude = mechanicData.Location?.X,
                YearsOfExperience = mechanicData.YearsOfExperience,
                Id = mechanicData.Id
            };


        }
    }
}
