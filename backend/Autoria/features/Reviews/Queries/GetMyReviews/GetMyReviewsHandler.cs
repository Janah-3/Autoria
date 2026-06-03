using System.Security.Claims;
using Autoria.features.Reviews.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reviews.Queries.GetMyReviews
{
    public class GetMyReviewsHandler : IRequestHandler<GetMyReviewsQuery, List<ReviewDto>>
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetMyReviewsHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<ReviewDto>> Handle(GetMyReviewsQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedException("User not authenticated.");

            var reviews = await _context.Reviews
                .Include(r => r.ServiceCenter)
                .Include(r => r.Photos)
                .Include(r => r.Reply)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync(cancellationToken);

            return reviews.Select(r => new ReviewDto
            {
                Id = r.Id,
                ServiceCenterId = r.ServiceCenterId,
                ServiceCenterName = r.ServiceCenter.Name,
                BookingId = r.BookingId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                Photos = r.Photos.Select(p => p.PhotoUrl).ToList(),
                Reply = r.Reply == null ? null : new ReviewReplyDto
                {
                    Id = r.Reply.Id,
                    Comment = r.Reply.Comment,
                    CreatedAt = r.Reply.CreatedAt
                }
            }).ToList();
        }
    }
}
