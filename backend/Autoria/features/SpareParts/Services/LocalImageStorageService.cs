using Autoria.shared.Exceptions;

namespace Autoria.features.SpareParts.Services
{
    public class LocalImageStorageService : IImageStorageService
    {
        private readonly IWebHostEnvironment _env;
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

        public LocalImageStorageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> SaveImageAsync(IFormFile file, CancellationToken cancellationToken = default)
        {
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!AllowedExtensions.Contains(ext))
                throw new BadRequestException($"Invalid image format. Allowed: jpg, jpeg, png, webp.");

            if (file.Length > MaxFileSizeBytes)
                throw new BadRequestException("Image size must not exceed 5 MB.");

            var folder = Path.Combine(_env.WebRootPath, "uploads", "spare-parts");
            Directory.CreateDirectory(folder);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(folder, fileName);

            await using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream, cancellationToken);

            return $"/uploads/spare-parts/{fileName}";
        }

        public void DeleteImage(string relativeUrl)
        {
            if (string.IsNullOrWhiteSpace(relativeUrl)) return;

            var fullPath = Path.Combine(_env.WebRootPath, relativeUrl.TrimStart('/'));
            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }
    }
}
