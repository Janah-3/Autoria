using System.Data;
using FluentValidation;

namespace Autoria.features.Reviews.Commands.AddReview
{
    public class AddReviewValidator : AbstractValidator<AddReviewCommand>
    {
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png" };
        private const long _maxFileSize = 5 * 1024 * 1024;

        public AddReviewValidator()
        {
            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5)
                .WithMessage("Rating must be between 1 and 5");

            RuleFor(x => x.Comment)
                .NotEmpty()
                .MaximumLength(500);

            RuleFor(x => x.Photos)
                .Must(p => p == null || p.Count <= 3)
                .WithMessage("Maximum 3 photos are allowed");

            RuleForEach(x => x.Photos)
                .ChildRules(photo =>
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
