using Autoria.features.Subscribtion.Commands.CancelSubscription;
using Autoria.features.Subscribtion.Commands.CreateSubscription;
using Autoria.features.Subscribtion.Dtos;
using Autoria.features.Subscribtion.Queries.GetSubscriptionPlans;
using Autoria.features.Subscribtion.Queries.GetSubscriptionStatus;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Subscribtion
{
    [ApiController]
    [Route("api/subscriptions")]
    public class SubscriptionController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SubscriptionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>View available plans and pricing — public</summary>
        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans()
        {
            var result = await _mediator.Send(new GetSubscriptionPlansQuery());
            return Ok(ApiResponse<List<SubscriptionPlanInfoDto>>.Ok(result));
        }

        /// <summary>Get current subscription status for a service center</summary>
        [HttpGet("{serviceCenterId:guid}/status")]
        [Authorize]
        public async Task<IActionResult> GetStatus(Guid serviceCenterId)
        {
            var result = await _mediator.Send(new GetSubscriptionStatusQuery(serviceCenterId));
            return Ok(ApiResponse<SubscriptionStatusDto>.Ok(result));
        }

        /// <summary>Subscribe to Premium plan (1, 3, 6, or 12 months)</summary>
        [HttpPost("{serviceCenterId:guid}/subscribe")]
        [Authorize]
        public async Task<IActionResult> Subscribe(Guid serviceCenterId, [FromBody] SubscribeRequest request)
        {
            var id = await _mediator.Send(new CreateSubscriptionCommand(serviceCenterId, request.MonthsDuration));
            return Ok(ApiResponse<Guid>.Ok(id, $"Premium plan activated for {request.MonthsDuration} month(s)."));
        }

        /// <summary>Cancel Premium subscription — stays active until end date</summary>
        [HttpPatch("{serviceCenterId:guid}/cancel")]
        [Authorize]
        public async Task<IActionResult> Cancel(Guid serviceCenterId, [FromBody] CancelSubscriptionRequest request)
        {
            await _mediator.Send(new CancelSubscriptionCommand(serviceCenterId, request.Reason));
            return Ok(ApiResponse<object>.Ok(null!, "Subscription cancelled. Access continues until the end of your billing period."));
        }
    }

    public record SubscribeRequest(int MonthsDuration);
    public record CancelSubscriptionRequest(string? Reason);
}
