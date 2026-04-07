using MediatR;

namespace Autoria.features.auth.Commands.forgetPassword
{
    public record ForgetPassCommand(string Email) : IRequest<Unit>;
    
}
