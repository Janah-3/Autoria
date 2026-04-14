using Autoria.features.user.Dtos;
using MediatR;

namespace Autoria.features.user.Querys.GetUserById
{
    public record GetUserByIdQuery(string Id) : IRequest<UserDto>;

}
