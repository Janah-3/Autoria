using Autoria.Features.Mechanics.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Features.Mechanics.Queries.GetMechanicProfile
{
    public class GetMechanicProfileHandler : IRequestHandler<GetMechanicProfileQuery, MechanicProfileDto>
    {
        private readonly AppDbContext _dbContext;

        public GetMechanicProfileHandler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<MechanicProfileDto> Handle(GetMechanicProfileQuery request, CancellationToken cancellationToken)
        {
            var profile = await _dbContext.MechanicProfiles
                .Where(m => m.Id == request.MechanicId && m.ApprovalStatus == ApprovalStatus.Approved)
                .Select(m => new MechanicProfileDto
                {
                    Id = m.Id,
                    FullName = m.User.FullName,
                    PhoneNumber = m.User.PhoneNumber!,
                    ProfilePhotoUrl = m.ProfilePhotoUrl,
                    YearsOfExperience = m.YearsOfExperience,
                    City = m.City,
                    Latitude = m.Location != null ? m.Location.Y : null,
                    Longitude = m.Location != null ? m.Location.X : null,
                    Rating = m.Rating,
                    ApprovalStatus = m.ApprovalStatus.ToString(),
                    Specializations = m.Specializations
                        .Select(s => s.ServiceType.Name)
                        .ToList(),
                    CreatedAt = m.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken)
                    ?? throw new NotFoundException("Mechanic not found");

            return profile;
        }
    }
}