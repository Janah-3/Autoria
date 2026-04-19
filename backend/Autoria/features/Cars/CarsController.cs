using Autoria.features.Car.Commands.AddCar;
using Autoria.features.Cars.Commands.UpdateCar;
using Autoria.features.user.Commands.UpdateUser;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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


        //[Authorize(Roles = "User")]
        [Authorize]
        [HttpPut("{CarId}")]
        public async Task<IActionResult> UpdateCar ([FromBody]UpdateCarRequestDto request, [FromRoute] Guid CarId)
        {
             await _mediator.Send(new UpdateCarCommand (
                request.Mileage,
                request.Color,
                request.LicensePlate,
                request.IsPrimary,
                CarId          
                 ));

            return Success("car updated successfuly");
        }
       




        }
}
