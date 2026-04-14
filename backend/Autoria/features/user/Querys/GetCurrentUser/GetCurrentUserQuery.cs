using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.user.Querys.GetCurrentUser
{

  
    public record GetCurrentUserQuery() : IRequest<CurrentUserDto>;
    public class CurrentUserDto
    {
        public string Id { get; set; } 
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Role { get; set; }
    }
}
