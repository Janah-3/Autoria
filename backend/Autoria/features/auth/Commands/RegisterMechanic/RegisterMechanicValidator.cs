using FluentValidation;

namespace Autoria.features.auth.Commands.RegisterMechanic
{
    public class RegisterMechanicValidator : AbstractValidator<RegisterMechanicCommand>
    {
        public RegisterMechanicValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one number");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Confirm your password")
                .Equal(x => x.Password).WithMessage("Passwords do not match");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches(@"^01[0125][0-9]{8}$").WithMessage("Invalid Egyptian phone number");

            RuleFor(x => x.YearsOfExperience)
                .GreaterThanOrEqualTo(0).WithMessage("Years of experience cannot be negative")
                .LessThanOrEqualTo(60).WithMessage("Invalid years of experience");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("City is required");

            RuleFor(x => x.Latitude)
                .InclusiveBetween(-90, 90).WithMessage("Invalid latitude");

            RuleFor(x => x.Longitude)
                .InclusiveBetween(-180, 180).WithMessage("Invalid longitude");

            RuleFor(x => x.ProfilePhoto)
                .NotNull().WithMessage("Profile photo is required");

            RuleFor(x => x.NationalId)
                .NotNull().WithMessage("National ID is required");

            RuleFor(x => x.SpecializationIds)
                .NotEmpty().WithMessage("At least one specialization is required");
        }
    }
}