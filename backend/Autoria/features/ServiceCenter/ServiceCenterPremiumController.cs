using Autoria.features.ServiceCenter.Commands.SendPromotion;
using Autoria.features.ServiceCenter.Commands.TrackProfileView;
using Autoria.features.ServiceCenter.Dtos;
using Autoria.features.ServiceCenter.Querys.GetServiceCenterAnalytics;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.ServiceCenter
{
    [ApiController]
    [Route("api/service-centers")]
    public class ServiceCenterPremiumController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ServiceCenterPremiumController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Track a profile view — call this every time a user opens a service center profile.
        /// Used for analytics conversion rate calculation.
        /// </summary>
        [HttpPost("{id:guid}/view")]
        public async Task<IActionResult> TrackView(Guid id)
        {
            await _mediator.Send(new TrackProfileViewCommand(id));
            return Ok(ApiResponse<object>.Ok(null!, "View tracked."));
        }

        /// <summary>
        /// Get analytics for a service center.
        /// Free plan: basic metrics only.
        /// Premium plan: full advanced analytics (profile views, conversion rate, top services, peak days, monthly trend).
        /// </summary>
        [HttpGet("{id:guid}/analytics")]
        [Authorize]
        public async Task<IActionResult> GetAnalytics(Guid id)
        {
            var result = await _mediator.Send(new GetServiceCenterAnalyticsQuery(id));
            return Ok(ApiResponse<ServiceCenterAnalyticsDto>.Ok(result));
        }

        /// <summary>
        /// Send a promotional email to all past clients — Premium only.
        /// Limited to 2 emails per month to prevent spam.
        /// </summary>
        [HttpPost("{id:guid}/promotions")]
        [Authorize]
        public async Task<IActionResult> SendPromotion(Guid id, [FromBody] SendPromotionRequest request)
        {
            var sentCount = await _mediator.Send(new SendPromotionCommand(id, request.Subject, request.Body));
            return Ok(ApiResponse<int>.Ok(sentCount, $"Promotional email sent to {sentCount} past clients."));
        }
    }

    public record SendPromotionRequest(string Subject, string Body);
}
