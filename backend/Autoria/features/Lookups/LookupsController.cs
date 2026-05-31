
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/lookups")]
public class LookupsController : BaseController
{
    public LookupsController(IMediator mediator) : base(mediator) { }

    [AllowAnonymous]
    [HttpGet("service-types")]
    public async Task<IActionResult> GetServiceTypes()
    {
        var result = await _mediator.Send(new GetServiceTypesQuery());
        return Success(result);
    }

    [AllowAnonymous]
    [HttpGet("car-brands")]
    public async Task<IActionResult> GetCarBrands()
    {
        var result = await _mediator.Send(new GetCarBrandsQuery());
        return Success(result);
    }
}