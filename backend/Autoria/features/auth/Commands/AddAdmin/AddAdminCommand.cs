using MediatR;

namespace Autoria.features.auth.Commands.AddAdmin
{
    public record AddAdminCommand(
     string FullName,
     string Email,
     string Password,
     string PhoneNumber
 ) : IRequest;
}
