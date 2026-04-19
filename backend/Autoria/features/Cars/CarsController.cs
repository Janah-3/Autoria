using Autoria.features.Car.Commands.AddCar;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Car
{
    public class CarsController : BaseController
    {
        public CarsController(IMediator Mediator) :base(Mediator) { }

        [Authorize(Roles = "User")]
        [HttpPost]
        public async Task<IActionResult> AddCar(AddCarCommand command)
        {
             await _mediator.Send(command);

            return Success("car added successfuly");
        }

    }
}
