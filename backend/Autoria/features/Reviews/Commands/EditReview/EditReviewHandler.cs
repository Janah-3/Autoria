using System.Security.Claims;
using Autoria.features.Reviews.Entity;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reviews.Commands.EditReview
{
    public class EditReviewHandler : IRequestHandler<EditReviewCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public EditReviewHandler(
            AppDbContext context,
            ICloudinaryService cloudinaryService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(EditReviewCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var review = await _context.Reviews
                .Include(r => r.Photos)
                .FirstOrDefaultAsync(r => r.Id == request.ReviewId && r.UserId == userId, cancellationToken)
                    ?? throw new NotFoundException("Review not found.");

            // Update core fields
            review.Rating = request.Rating;
            review.Comment = request.Comment;

            // Remove photos the user explicitly flagged for removal
            if (request.PhotoUrlsToRemove != null && request.PhotoUrlsToRemove.Any())
            {
                var toRemove = review.Photos
                    .Where(p => request.PhotoUrlsToRemove.Contains(p.PhotoUrl))
                    .ToList();

                foreach (var photo in toRemove)
                {
                    await _cloudinaryService.DeleteImageAsync(photo.PhotoUrl);
                    review.Photos.Remove(photo);
                }
            }

            // Upload new photos — total must not exceed 3
            if (request.NewPhotos != null && request.NewPhotos.Any())
            {
                var totalAfterAdd = review.Photos.Count + request.NewPhotos.Count;
                if (totalAfterAdd > 3)
                    throw new BadRequestException("A review can have at most 3 photos in total.");

                foreach (var photo in request.NewPhotos)
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
