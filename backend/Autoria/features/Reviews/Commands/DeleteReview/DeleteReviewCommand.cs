using MediatR;

namespace Autoria.features.Reviews.Commands.DeleteReview
{
    public record DeleteReviewCommand(Guid ReviewId) : IRequest<Unit>;
}
