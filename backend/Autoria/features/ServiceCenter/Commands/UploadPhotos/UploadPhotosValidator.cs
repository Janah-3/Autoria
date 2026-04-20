using FluentValidation;

namespace Autoria.features.ServiceCenter.Commands.UploadPhotos
{
    public class UploadPhotosValidator : AbstractValidator<UploadPhotosCommand>
    {
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png" };
        private const long _maxFileSize = 5 * 1024 * 1024; // 5MB
        private const int _maxPhotos = 10;
        private const int _minPhotos = 3;

        public UploadPhotosValidator()
        {
            RuleFor(x => x.Photos)
                .NotEmpty().WithMessage("At least 3 photos are required")
                .Must(p => p.Count >= _minPhotos)
                .WithMessage($"Minimum {_minPhotos} photos are required")
                .Must(p => p.Count <= _maxPhotos)
                .WithMessage($"Maximum {_maxPhotos} photos are allowed");

            RuleForEach(x => x.Photos).ChildRules(photo =>
            {
                photo.RuleFor(p => p.Length)
                    .LessThanOrEqualTo(_maxFileSize)
                    .WithMessage("Each photo must be less than 5MB");
                photo.RuleFor(p => Path.GetExtension(p.FileName).ToLower())
                    .Must(ext => _allowedExtensions.Contains(ext))
                    .WithMessage("Only .jpg, .jpeg, and .png files are allowed");
            });
        }
    }
}
