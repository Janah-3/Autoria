using System.Security.Claims;
using Autoria.features.user.Dtos;
using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.user.Commands.UpdateCurrentUser
{
    public class UpdateCurrentUser : IRequestHandler<UpdateCurrentUserCommand, Unit>
    {
        private readonly IHttpContextAccessor _ContextAccessor;
        private readonly UserManager<User> _userManager;

        public UpdateCurrentUser(IHttpContextAccessor contextAccessor , UserManager<User> userManager )
        {
            _ContextAccessor = contextAccessor;
            _userManager = userManager;
        }

        public async Task<Unit> Handle(UpdateCurrentUserCommand request, CancellationToken cancellationToken)
        {
            var context = _ContextAccessor.HttpContext??throw new BadRequestException("no logged in user");
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)?? throw new UnauthorizedException("unautherized user");

            var user = await _userManager.FindByIdAsync( userId )?? throw new NotFoundException("user not found") ;

            user.FullName = request.FullName?? user.FullName;
            user.PhoneNumber = request.PhoneNumber?? user.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                throw new BadRequestException("Failed to update user", errors);
            }


            return Unit.Value;
        }

    }
    }

