using MediatR;

namespace Autoria.features.auth.Commands.ChangePassword
{
    public record ChangePasswordCommand(
        string OldPassword,
        string NewPassword,
        string ConfirmPassword
        
        ): IRequest;
    
}
