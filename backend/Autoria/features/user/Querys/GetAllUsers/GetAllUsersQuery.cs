using Autoria.features.user.Dtos;
using Autoria.shared.Dtos;
using MediatR;

namespace Autoria.features.user.Querys.GetAllUsers
{

    public record GetAllUsersQuery(
      int Page = 1,
      int PageSize = 10,
      string? Search = null,
      bool? IsBanned = null,
      string? Role = null
  ) : IRequest<PagedResponse<UserDto>>;

}
