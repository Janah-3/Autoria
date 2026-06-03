using Autoria.features.Car.Commands.AddCar;
using Autoria.features.Reviews.Commands.AddReview;
using Autoria.features.Reviews.Commands.DeleteReview;
using Autoria.features.Reviews.Commands.EditReview;
using Autoria.features.Reviews.Queries.GetMyReviews;
using Autoria.features.Reviews.Queries.GetServiceCenterReviews;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Autoria.features.Reviews
{
    [Route("api/reviews")]
    public class ReviewsController : BaseController
    {
        public ReviewsController(IMediator mediator) : base(mediator) { }

        // ── Create ─────────────────────────────────────────────────────────────

        /// <summary>
        /// Submit a review for a completed booking.
        /// POST /api/reviews
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromForm] AddReviewCommand command)
        {
            await _mediator.Send(command);
            return Success("Review submitted successfully.");
        }

        // ── User: own reviews ──────────────────────────────────────────────────

        /// <summary>
        /// Get all reviews the authenticated user has written.
        /// GET /api/reviews/mine
        /// </summary>
        [Authorize]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMyReviews()
        {
            var result = await _mediator.Send(new GetMyReviewsQuery());
            return Ok(result);
        }

        /// <summary>
        /// Edit one of the authenticated user's reviews.
        /// PUT /api/reviews/{reviewId}
        /// </summary>
        [Authorize]
        [HttpPut("{reviewId:guid}")]
        public async Task<IActionResult> EditReview(Guid reviewId, [FromForm] EditReviewRequest request)
        {
            var command = new EditReviewCommand(
                reviewId,
                request.Rating,
                request.Comment,
                request.NewPhotos,
                request.PhotoUrlsToRemove);

            await _mediator.Send(command);
            return Success("Review updated successfully.");
        }

        /// <summary>
        /// Delete one of the authenticated user's reviews.
        /// DELETE /api/reviews/{reviewId}
        /// </summary>
        [Authorize]
        [HttpDelete("{reviewId:guid}")]
        public async Task<IActionResult> DeleteReview(Guid reviewId)
        {
            await _mediator.Send(new DeleteReviewCommand(reviewId));
            return Success("Review deleted successfully.");
        }

        // ── Public: service-center reviews ────────────────────────────────────

        /// <summary>
        /// Get all reviews for a service center (publicly accessible).
        /// GET /api/reviews/service-centers/{serviceCenterId}
        /// </summary>
        [HttpGet("service-centers/{serviceCenterId:guid}")]
        public async Task<IActionResult> GetServiceCenterReviews(Guid serviceCenterId)
        {
            var result = await _mediator.Send(new GetServiceCenterReviewsQuery(serviceCenterId));
            return Ok(result);
        }
    }

    /// <summary>Form model for editing a review (keeps IFormFile out of the command record for cleaner binding).</summary>
    public class EditReviewRequest
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = default!;
        public List<IFormFile>? NewPhotos { get; set; }
        public List<string>? PhotoUrlsToRemove { get; set; }
    }
}
