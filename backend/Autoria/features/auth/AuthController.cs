using Autoria.features.auth.Commands.forgetPassword;
using Autoria.features.auth.Commands.Login;
using Autoria.features.auth.Commands.register;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

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

        [HttpPost("forget")]
        public async Task<IActionResult> ForgetPass(ForgetPassCommand command)
        {
            var result = await _mediator.Send(command);
            return  Ok(result);
        }
        

    }
}
