namespace Autoria.features.SpareParts.Services
{
    public interface IImageStorageService
    {
        /// <summary>Saves image to wwwroot/uploads/spare-parts and returns the relative URL</summary>
        Task<string> SaveImageAsync(IFormFile file, CancellationToken cancellationToken = default);
        void DeleteImage(string relativeUrl);
    }
}
