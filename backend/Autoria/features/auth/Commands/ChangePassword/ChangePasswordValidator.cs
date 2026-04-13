using FluentValidation;

namespace Autoria.features.auth.Commands.ChangePassword
{
    public class ChangePasswordValidator : AbstractValidator<ChangePasswordCommand>
    {
        public ChangePasswordValidator()
        {
            RuleFor(x=> x.OldPassword).NotEmpty().WithMessage("old password is required");
            RuleFor(x=> x.NewPassword).NotEmpty().WithMessage("new password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one number");

            RuleFor(x => x.ConfirmPassword).NotEmpty().WithMessage("Confirm your password")
                .Equal(x => x.NewPassword).WithMessage("Passwords do not match");

        }
    }
}
