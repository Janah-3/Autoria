using FluentValidation;

namespace Autoria.features.auth.Commands.forgetPassword
{
    public class ForgotPassValidator : AbstractValidator<ForgetPassCommand>
    {
        public ForgotPassValidator()
        {
            RuleFor(x => x.Email).NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("invalid email format");
        }
    }
}
