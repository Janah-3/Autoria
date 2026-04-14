using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.shared.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseController : ControllerBase
    {

        protected readonly IMediator _mediator;

        public BaseController(IMediator mediator)
        {
            _mediator = mediator;
        }

        protected IActionResult Success<T>(T data, string message = "Success")
            => Ok(ApiResponse<T>.Ok(data, message));

        protected IActionResult Success(string message = "Success")
            => Ok(ApiResponse<string>.Ok(message));

    
    }
}
