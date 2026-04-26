using System.Security.Claims;
using Autoria.features.Booking;
using Autoria.features.Reviews.Entity;
using Autoria.Infrastructure.Email.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reviews.Commands.AddReview
{
    public class AddReviewHandler : IRequestHandler<AddReviewCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AddReviewHandler(
            AppDbContext context,
            ICloudinaryService cloudinaryService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(AddReviewCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("unauthorized user");

            // Validate booking exists, belongs to user, is completed, and is for this service center
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b =>
                    b.Id == request.BookingId &&
                    b.UserId == userId &&
                    b.ServiceCenterId == request.ServiceCenterId &&
                    b.Status == BookingStatus.Completed, cancellationToken)
                        ?? throw new BadRequestException("No completed booking found for this service center");

            // Prevent duplicate reviews for the same booking
            var alreadyReviewed = await _context.Reviews
                .AnyAsync(r => r.BookingId == request.BookingId, cancellationToken);

            if (alreadyReviewed)
                throw new BadRequestException("You have already reviewed this booking");

            var review = new Review
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ServiceCenterId = request.ServiceCenterId,
                BookingId = request.BookingId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);

            if (request.Photos != null && request.Photos.Any())
            {
                foreach (var photo in request.Photos)
                {
                    var url = await _cloudinaryService.UploadImageAsync(photo, "review-photos");

                    review.Photos.Add(new ReviewPhoto
                    {
                        Id = Guid.NewGuid(),
                        ReviewId = review.Id,
                        PhotoUrl = url,
                        UploadedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
