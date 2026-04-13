using FluentValidation;

namespace Autoria.features.auth.Commands.ResetPassword
{
    public class ResetPassValidation : AbstractValidator<ResetPassCommand>
    {

        public ResetPassValidation()
        {
            RuleFor(x => x.Email).NotEmpty().WithMessage("Email is required")
              .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.Token).NotEmpty().WithMessage("the token is required");

            RuleFor(x => x.Password).NotEmpty().WithMessage("new password is required")
               .MinimumLength(8).WithMessage("Password must be at least 8 characters")
               .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
               .Matches("[0-9]").WithMessage("Password must contain at least one number");

            RuleFor(x => x.ConfirmPassword).NotEmpty().WithMessage("confirm your password ").Matches(x => x.ConfirmPassword)
                .WithMessage("password doesn't match");


        }
    }
}
