using FluentValidation;

namespace Autoria.features.auth.Commands.register
{
    public class RegisterValidator :AbstractValidator<RegisterCommand> 
    {
        public RegisterValidator()
        {

            RuleFor(x => x.FullName).NotEmpty().WithMessage("full name is required")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters");


            RuleFor(x => x.Email).NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");


            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one number");


            RuleFor(x => x.ConfirmPassword).NotEmpty().WithMessage("Confirm your password")
                .Equal(x => x.Password).WithMessage("Passwords do not match");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches(@"^01[0125][0-9]{8}$").WithMessage("Invalid Egyptian phone number");
        }
    }
}
