using Autoria.shared.Enums;

namespace Autoria.shared.Contracts
{
    public interface IAdminLogService
    {
        Task LogAsync(string adminId, AdminActionType action, AdminTargetType targetType, string targetId, string? details = null);
    }
}
