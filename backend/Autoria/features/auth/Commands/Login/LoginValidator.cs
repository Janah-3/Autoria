using FluentValidation;

namespace Autoria.features.auth.Commands.Login
{
    public class LoginValidator :AbstractValidator<LoginCommand>
    {

        public LoginValidator()
        {
            RuleFor(x => x.Email).NotEmpty().WithMessage("Email is required").EmailAddress().WithMessage("invalid email format");

            RuleFor(x => x.Password).NotEmpty().WithMessage("password is required");
        }
    }
}
