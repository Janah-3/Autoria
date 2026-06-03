using Autoria.features.Owner.Dashboard;
using Autoria.features.Owner.Dashboard.Dtos;
using Autoria.features.Reviews.Dtos;
using Autoria.features.Reviews.Queries.GetOwnerServiceCenterReviews;
using Autoria.shared.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Owner
{
    [ApiController]
    [Route("api/service-centers/{serviceCenterId:guid}/dashboard")]
    [Authorize]
    public class ServiceCenterDashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ServiceCenterDashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all dashboard data in one call:
        /// metrics (today's bookings, pending, reviews, rating),
        /// today's appointments list, recent activity feed, is open today.
        /// GET /api/service-centers/{serviceCenterId}/dashboard
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetDashboard(Guid serviceCenterId)
        {
            var result = await _mediator.Send(new GetOwnerDashboardQuery(serviceCenterId));
            return Ok(ApiResponse<OwnerDashboardDto>.Ok(result));
        }

        /// <summary>
        /// Get all reviews for the owner's service center, including
        /// aggregate stats (average rating, rating breakdown) and the full review list.
        /// GET /api/service-centers/{serviceCenterId}/dashboard/reviews
        /// </summary>
        [HttpGet("reviews")]
        public async Task<IActionResult> GetReviews(Guid serviceCenterId)
        {
            var result = await _mediator.Send(new GetOwnerServiceCenterReviewsQuery(serviceCenterId));
            return Ok(ApiResponse<ServiceCenterReviewsDto>.Ok(result));
        }
    }
}
