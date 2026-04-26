using Autoria.features.Car.Commands.AddCar;
using Autoria.features.Reviews.Commands.AddReview;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Reviews
{
    public class ReviewsController : BaseController
    {

        public ReviewsController(IMediator mediator):base(mediator) { }
        

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromForm] AddReviewCommand command)
        {
            await _mediator.Send(command);
            return Success("Review submitted successfully");
        }
    }
}
