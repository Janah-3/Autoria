using FluentValidation;

namespace Autoria.features.Reviews.Commands.EditReview
{
    public class EditReviewValidator : AbstractValidator<EditReviewCommand>
    {
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png" };
        private const long _maxFileSize = 5 * 1024 * 1024;

        public EditReviewValidator()
        {
            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5)
                .WithMessage("Rating must be between 1 and 5.");

            RuleFor(x => x.Comment)
                .NotEmpty()
                .MaximumLength(500);

            RuleFor(x => x.NewPhotos)
                .Must(p => p == null || p.Count <= 3)
                .WithMessage("Maximum 3 new photos allowed.");

            RuleForEach(x => x.NewPhotos)
                .ChildRules(photo =>
                {
                    photo.RuleFor(p => p.Length)
                        .LessThanOrEqualTo(_maxFileSize)
                        .WithMessage("Each photo must be less than 5MB.");

                    photo.RuleFor(p => Path.GetExtension(p.FileName).ToLower())
                        .Must(ext => _allowedExtensions.Contains(ext))
                        .WithMessage("Only .jpg, .jpeg, and .png files are allowed.");
                });
        }
    }
}
