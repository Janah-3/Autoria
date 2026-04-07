using MediatR;

namespace Autoria.features.auth.Commands.ResetPassword
{
    public record ResetPassCommand(
        string Email,
        string Token,
        string Password,
        string ConfirmPassword

        ): IRequest<Unit>;
    
}
