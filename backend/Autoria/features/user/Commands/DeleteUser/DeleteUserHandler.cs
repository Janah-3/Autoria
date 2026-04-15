using Autoria.Infrastructure.Identity.entities;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.user.Commands.DeleteUser
{
    public class DeleteUserHandler : IRequestHandler<DeleteUserCommand, Unit>
    {
        private readonly UserManager<User> _userManager;

        public DeleteUserHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }
        public async Task<Unit> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
           var user = await _userManager.FindByIdAsync(request.UserId)?? throw new NotFoundException("user not found") ;

           var result = await  _userManager.DeleteAsync(user);

            if(!result.Succeeded)
{
                var errors = result.Errors.Select(e => e.Description).ToList();
                throw new BadRequestException("Failed to delete user", errors);
            }

            return Unit.Value;

        }
    }
}
