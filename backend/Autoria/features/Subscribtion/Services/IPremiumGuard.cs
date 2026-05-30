namespace Autoria.features.Subscribtion.Services
{
    public interface IPremiumGuard
    {
        Task EnsurePremiumAsync(Guid serviceCenterId, CancellationToken cancellationToken = default);
        Task<bool> IsPremiumAsync(Guid serviceCenterId, CancellationToken cancellationToken = default);
    }
}
