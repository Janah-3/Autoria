using System.Security.Claims;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Contracts;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reviews.Commands.DeleteReview
{
    public class DeleteReviewHandler : IRequestHandler<DeleteReviewCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteReviewHandler(
            AppDbContext context,
            ICloudinaryService cloudinaryService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var review = await _context.Reviews
                .Include(r => r.Photos)
                .FirstOrDefaultAsync(r => r.Id == request.ReviewId && r.UserId == userId, cancellationToken)
                    ?? throw new NotFoundException("Review not found.");

            // Delete all uploaded photos from Cloudinary first
            foreach (var photo in review.Photos)
                await _cloudinaryService.DeleteImageAsync(photo.PhotoUrl);

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
