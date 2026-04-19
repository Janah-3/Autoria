using Autoria.features.Car.Commands.AddCar;
using Autoria.features.Cars.Commands.DeleteCar;
using Autoria.features.Cars.Commands.UpdateCar;
using Autoria.features.Cars.Querys.GetAllCars;
using Autoria.features.Cars.Querys.GetCarById;
using Autoria.features.Cars.Querys.GetCarsByUserId;
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


        [Authorize(Roles = "User")]
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


        [Authorize]
        [HttpDelete("{CarId}")]

        public async Task<IActionResult> DeleteCar([FromRoute] Guid CarId)
        {
            await _mediator.Send(new DeleteCarCommand
            (
                CarId
            ));

            return Success("car deleted successfuly");
        }


        [Authorize]
        [HttpGet("{CarId}")]

        public async Task<IActionResult> GetCarById([FromRoute]Guid CarId)
        {
         var result =  await _mediator.Send(
                new GetCarByIdQuery(CarId)
            );

            return Success(result);
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllCars([FromQuery] GetAllCarsQuery query)
        {
            var result = await _mediator.Send(query);
            return Success(result);
        }


        [Authorize]
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCarsByUserId( Guid userId, [FromQuery] GetCarsByUserIdQuery query)
        {
            var updatedQuery = query with { UserId = userId };

            var result = await _mediator.Send(updatedQuery);
            return Ok(result);
        }


    }
}
