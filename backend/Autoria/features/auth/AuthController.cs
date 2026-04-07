using Autoria.features.auth.Commands.forgetPassword;
using Autoria.features.auth.Commands.Login;
using Autoria.features.auth.Commands.register;
using Autoria.features.auth.Commands.ResetPassword;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace Autoria.features.auth
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController:ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {

            _mediator = mediator; 
        }

        [HttpPost("login")]
        public async Task<IActionResult> login(LoginCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }


        [HttpPost("register")]
        public async Task<IActionResult> register(RegisterCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);

        }

        [HttpPost("forgetPass")]
        public async Task<IActionResult> ForgetPass(ForgetPassCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(new
            {
                message = "a reset link has been sent."
            });
        }


        [HttpPost("ResetPass")]
        public async Task<IActionResult> RestPassword(ResetPassCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(new
            {
                message = "Password reset successfully"
            });
        }
        

    }
}
