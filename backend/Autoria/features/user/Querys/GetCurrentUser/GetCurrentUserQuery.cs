using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.user.Querys.GetCurrentUser
{

  
    public record GetCurrentUserQuery() : IRequest<CurrentUserDto>;
    public class CurrentUserDto
    {
        public string Id { get; set; } 
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string PhoneNumber { get; set; } = default!;
        public string Role { get; set; } = default!;
    }
}
