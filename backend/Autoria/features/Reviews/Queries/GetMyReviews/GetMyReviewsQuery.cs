using Autoria.features.Reviews.Dtos;
using MediatR;

namespace Autoria.features.Reviews.Queries.GetMyReviews
{
    public record GetMyReviewsQuery : IRequest<List<ReviewDto>>;
}
