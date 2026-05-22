using System.Security.Claims;
using Autoria.features.MileageTracking.Dtos;
using Autoria.features.MileageTracking.Mappers;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.MileageTracking.Queries.GetMaintenanceReminders
{
    public class GetMaintenanceRemindersHandler : IRequestHandler<GetMaintenanceRemindersQuery, List<MaintenanceReminderDto>>
    {
        private readonly AppDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetMaintenanceRemindersHandler(AppDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<MaintenanceReminderDto>> Handle(GetMaintenanceRemindersQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var query = _db.MaintenanceReminders
                .Include(r => r.Car)
                .Where(r => r.UserId == userId && r.IsActive);

            if (request.CarId.HasValue)
                query = query.Where(r => r.CarId == request.CarId.Value);

            if (request.IsTriggered.HasValue)
                query = query.Where(r => r.IsTriggered == request.IsTriggered.Value);

            var items = await query
                .OrderBy(r => r.MileageThreshold)
                .ToListAsync(cancellationToken);

            return items.Select(MileageMapper.ToDto).ToList();
        }
    }
}
