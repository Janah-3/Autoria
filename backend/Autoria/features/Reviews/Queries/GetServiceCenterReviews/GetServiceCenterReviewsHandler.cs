using Autoria.features.Reviews.Dtos;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.Reviews.Queries.GetServiceCenterReviews
{
    public class GetServiceCenterReviewsHandler
        : IRequestHandler<GetServiceCenterReviewsQuery, ServiceCenterReviewsDto>
    {
        private readonly AppDbContext _context;

        public GetServiceCenterReviewsHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceCenterReviewsDto> Handle(
            GetServiceCenterReviewsQuery request,
            CancellationToken cancellationToken)
        {
            var centerExists = await _context.ServiceCenters
                .AnyAsync(sc => sc.Id == request.ServiceCenterId, cancellationToken);

            if (!centerExists)
                throw new NotFoundException("Service center not found.");

            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Photos)
                .Include(r => r.Reply)
                .Where(r => r.ServiceCenterId == request.ServiceCenterId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync(cancellationToken);

            var avgRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

            var ratingBreakdown = Enumerable.Range(1, 5).ToDictionary(
                star => star,
                star => reviews.Count(r => r.Rating == star));

            return new ServiceCenterReviewsDto
            {
                ServiceCenterId = request.ServiceCenterId,
                TotalReviews = reviews.Count,
                AverageRating = Math.Round(avgRating, 1),
                RatingBreakdown = ratingBreakdown,
                Reviews = reviews.Select(r => new ReviewWithAuthorDto
                {
                    Id = r.Id,
                    BookingId = r.BookingId,
                    AuthorName = r.User.FullName,
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
                }).ToList()
            };
        }
    }
}
