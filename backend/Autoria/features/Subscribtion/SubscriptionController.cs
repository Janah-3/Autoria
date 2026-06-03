using Autoria.features.Payments.Enums;
using Autoria.features.Subscribtion.Commands.CancelSubscription;
using Autoria.features.Subscribtion.Commands.CreateSubscription;
using Autoria.features.Subscribtion.Commands.PaySubscription;
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

        /// <summary>
        /// Step 1 — Create subscription (PendingPayment).
        /// Returns subscriptionId + amount to proceed to payment.
        /// </summary>
        [HttpPost("{serviceCenterId:guid}/subscribe")]
        [Authorize]
        public async Task<IActionResult> Subscribe(Guid serviceCenterId)
        {
            var result = await _mediator.Send(new CreateSubscriptionCommand(serviceCenterId));
            return Ok(ApiResponse<SubscriptionPaymentDto>.Ok(result, result.Message));
        }

        /// <summary>
        /// Step 2 — Pay for the subscription to activate it.
        /// Card: provide cardToken. Cash: no token needed.
        /// </summary>
        [HttpPost("{serviceCenterId:guid}/pay")]
        [Authorize]
        public async Task<IActionResult> Pay(Guid serviceCenterId, [FromBody] PaySubscriptionRequest request)
        {
            var result = await _mediator.Send(new PaySubscriptionCommand(
                request.SubscriptionId,
                request.CardToken));
            return Ok(ApiResponse<PaySubscriptionResult>.Ok(result, result.Message));
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

    public record PaySubscriptionRequest(Guid SubscriptionId, string CardToken);
    public record CancelSubscriptionRequest(string? Reason);
}
