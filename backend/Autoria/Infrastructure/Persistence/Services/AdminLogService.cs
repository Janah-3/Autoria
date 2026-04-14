using Autoria.Infrastructure.Persistence.Entities;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Infrastructure.Persistence.Services
{
    public class AdminLogService : IAdminLogService
    {
        private readonly AppDbContext _dbContext;

        public AdminLogService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task LogAsync(string adminId, AdminActionType action, AdminTargetType targetType, string targetId, string? details = null)
        {
            var log = new AdminLog
            {
                Id = Guid.NewGuid(),
                CreatedById = adminId,
                ActionType = action,
                TargetType = targetType,
                TargetId = targetId,
                Details = details,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.AdminLogs.AddAsync(log);
            await _dbContext.SaveChangesAsync();

        }
    }
}
