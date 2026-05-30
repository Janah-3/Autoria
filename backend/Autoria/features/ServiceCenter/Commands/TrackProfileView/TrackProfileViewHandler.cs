using System.Security.Claims;
using Autoria.features.ServiceCenter.Entities;
using Autoria.Infrastructure.Persistence;
using MediatR;

namespace Autoria.features.ServiceCenter.Commands.TrackProfileView
{
    public class TrackProfileViewHandler : IRequestHandler<TrackProfileViewCommand>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TrackProfileViewHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(TrackProfileViewCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var ipAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

            _db.ProfileViews.Add(new ProfileView
            {
                Id = Guid.NewGuid(),
                ServiceCenterId = request.ServiceCenterId,
                UserId = userId,
                IpAddress = ipAddress,
                ViewedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
