using Autoria.features.user.Dtos;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.user.Querys.GetAllUsers
{
    public class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, PagedResponse<UserDto>>
    {
        private readonly UserManager<User> _userManager;

        public GetAllUsersHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<PagedResponse<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            var query = _userManager.Users.AsQueryable();

           
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                query = query.Where(u =>
                    u.FullName.Contains(request.Search) ||
                    u.Email.Contains(request.Search) ||
                    u.PhoneNumber.Contains(request.Search));
            }

         
            if (request.IsBanned.HasValue)
            {
                query = query.Where(u => u.IsBanned == request.IsBanned.Value);
            }

            
            var totalCount = await query.CountAsync(cancellationToken);

           
            var page = request.Page < 1 ? 1 : request.Page;
            var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

            var skip = (request.Page - 1) * request.PageSize;

            var users = await query
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var dtos = new List<UserDto>();

            foreach (var user in users)
            {
                var role = (await _userManager.GetRolesAsync(user)).FirstOrDefault();

                // Role filter
                if (!string.IsNullOrWhiteSpace(request.Role) && role != request.Role)
                    continue;

                dtos.Add(new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Role = role
                });
            }

            return new PagedResponse<UserDto>(
                dtos,
                totalCount,
                request.Page,
                request.PageSize
            );
        }
    }
}