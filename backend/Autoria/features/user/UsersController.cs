using Autoria.features.user.Commands.Ban_user;
using Autoria.features.user.Commands.DeleteUser;
using Autoria.features.user.Commands.UnbanUser;
using Autoria.features.user.Commands.UpdateCurrentUser;
using Autoria.features.user.Commands.UpdateUser;
using Autoria.features.user.Dtos;
using Autoria.features.user.Querys.GetAllUsers;
using Autoria.features.user.Querys.GetCurrentUser;
using Autoria.features.user.Querys.GetUserById;
using Autoria.features.Users.Commands.UpdateUserLocation;
using Autoria.shared.Controllers;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace Autoria.features.user
{
    public class UsersController : BaseController
    {

        public UsersController(IMediator mediator) : base(mediator) { }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var result = await _mediator.Send(new GetCurrentUserQuery());
            return Success(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUser([FromQuery] GetAllUsersQuery query)
        {
            var result = await _mediator.Send(query);
            return Success(result);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var result = await _mediator.Send(new GetUserByIdQuery(id));
            return Success(result);
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateCurrentUser(UpdateCurrentUserCommand  command)
        {
            var result = await _mediator.Send(command);
            return Success("user data is updated successfully");
        }


        [Authorize(Roles = "Admin")]
        [HttpPut("{userId}")]

        public async Task<IActionResult> UpdateUser([FromRoute] string userId,[FromBody] UpdateUserRequest request)
        {
            await _mediator.Send(new UpdateUserCommand(
                userId,
                request.FullName,
                request.PhoneNumber,
                request.Role
            ));

            return Success("User updated successfully");
        }
        
        [Authorize(Roles = "Admin")]
        [HttpDelete("{userId}")]

        public async Task<IActionResult> DeleteUser([FromRoute] string userId)
        {
            await _mediator.Send(new DeleteUserCommand(
                userId
               
            ));

            return Success("User deleted successfully");
        } 
        
        [Authorize(Roles = "Admin")]
        [HttpPatch("{userId}/Ban")]

        public async Task<IActionResult> BanUser([FromRoute] string userId ,BanUserRequest request)
        {
            await _mediator.Send(new BanUserCommand(
                userId,
                request.details 
            ));

            return Success("User Banned successfully");
        } 
        
        [Authorize(Roles = "Admin")]
        [HttpPatch("{userId}/Unban")]

        public async Task<IActionResult> UnbanUser([FromRoute] string userId )
        {
            await _mediator.Send(new UnbanUserCommand(
                userId  
            ));

            return Success("User unbanned successfully");
        }


        [HttpPut("my/location")]
        [Authorize]
        public async Task<IActionResult> UpdateLocation([FromBody] UpdateUserLocationCommand command)
        {
            await _mediator.Send(command);
            return Success("Location updated successfully");
        }




    }
}
