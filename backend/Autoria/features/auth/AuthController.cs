using Autoria.features.auth.Login;
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
        

    }
}
